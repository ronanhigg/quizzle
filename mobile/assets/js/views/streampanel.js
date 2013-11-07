/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'moment',
    'app'
], function ($, _, Backbone, Kinvey, moment, App) {

    "use strict";

    return Backbone.View.extend({

        className: 'streamPanel',
        template: App.getTemplate('stream-panel'),

        events: {
        },

        initialize: function (options) {
            var _this = this;
        },

        render: function () {

            /*var startingAt = this.model.get('broadcast_starting_at');

            startingAt = moment(startingAt.toString(), "YYYYMMDDTHHmmssZ");
            startingAt = startingAt.format('HH:mm - ddd D MMM YYYY');

            this.$el.html(this.template({
                'channelIdentifier': this.model.get('channel_identifier'),
                'startingAt': startingAt,
                'adIdentifier': this.model.get('ad_identifier')
            }));*/

            var startingAt, storyboardBackgroundPosition, logos, answers, question,

                positions = [
                    '0px 0px',
                    '165px 0px',
                    '330px 0px',
                    '0px 95px',
                    '165px 95px',
                    '330px 95px',
                    '0px 190px',
                    '165px 190px',
                    '330px 190px'
                ],

                doc = this.options.doc,

                hasAdData = !doc.noAdData,
                hasQuizData = hasAdData && !doc.noQuizData;

            startingAt = doc.broadcast_starting_at;
            startingAt = moment(startingAt.toString(), "YYYYMMDDTHHmmssZ");
            startingAt = startingAt.format('HH:mm - ddd D MMM YYYY');

            storyboardBackgroundPosition = positions[_.random(0, 8)];

            if (hasAdData) {
                logos = _.clone(doc.otherLogos);
                logos.push(doc.advertiserLogo);
                logos = _.shuffle(logos);
            }

            if (hasQuizData) {
                question = doc.question.question;
                answers = [
                    doc.question.correct_answer,
                    doc.question.incorrect_answer_1,
                    doc.question.incorrect_answer_2,
                    doc.question.incorrect_answer_3
                ];
                answers = _.shuffle(answers);
            }


            this.$el.html(this.template({
                'hasAdData': hasAdData,
                'hasQuizData': hasQuizData,
                'channelName': doc.channelName,
                'startingAt': startingAt,
                'adTitle': doc.adTitle,
                'storyboardURL': doc.storyboardURL,
                'adIdentifier': doc.ad_identifier,
                'storyboardBackgroundPosition': storyboardBackgroundPosition,
                'logos': logos,
                'question': question,
                'answers': answers
            }));

            return this;
        }

    });

});
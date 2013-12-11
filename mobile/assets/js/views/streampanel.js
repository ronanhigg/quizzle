/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'vendor/grids',
    'kinvey',
    'moment',
    'app'
], function ($, _, Backbone, Grids, Kinvey, moment, App) {

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

            var startingAt, storyboardBackgroundPosition, logos, answers, question,
                $firstRowLogos, $secondRowLogos, $logos,

                positions = [
                    '661px -7px',
                    '330px -7px',
                    '-7px -7px',
                    '661px -198px',
                    '330px -198px',
                    '-7px -198px',
                    '661px -338px',
                    '330px -338px'
                    //'-7px -338px', - Remove this frame
                ],

                doc = this.options.doc,

                hasAdData = !doc.noAdData,
                hasQuizData = hasAdData && !doc.noQuizData;

            startingAt = doc.broadcast_starting_at;
            startingAt = moment(startingAt.toString(), "YYYYMMDDTHHmmssZ");
            startingAt = startingAt.format('HH:mm - ddd D MMM YYYY');

            storyboardBackgroundPosition = positions[_.random(0, 8)];

            this.options.panels[doc._id] = {};

            if (hasAdData) {
                logos = _.clone(doc.otherLogos);
                logos.push(doc.advertiserLogo);
                logos = _.shuffle(logos);
            }

            this.options.panels[doc._id].correctLogoIndex = _.indexOf(logos, doc.advertiserLogo);

            if (hasQuizData) {
                question = doc.question.question;
                answers = [
                    doc.question.correct_answer,
                    doc.question.incorrect_answer_1,
                    doc.question.incorrect_answer_2,
                    doc.question.incorrect_answer_3
                ];
                answers = _.shuffle(answers);

                this.options.panels[doc._id].correctTriviaIndex = _.indexOf(answers, doc.question.correct_answer);
            }

            this.$el.html(this.template({
                'id': doc._id,
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
                'answers': answers,
                'displayID': this.options.displayID
            }));

            /*$firstRowLogos = this.$el.find('.js-first-row-logo');
            $secondRowLogos = this.$el.find('.js-second-row-logo');

            $firstRowLogos.equalHeight();
            $secondRowLogos.equalHeight();

            $(window).on('resize', function () {
                $firstRowLogos.equalHeight();
                $secondRowLogos.equalHeight();
            });*/

            /*$logos = this.$el.find('.js-logos');

            $logos.equalHeight(2);

            $(window).on('resize', function () {
                $logos.equalHeight(2);
            });*/

            $logos = this.$el.find('.js-stream-logo-guess');

            _.each($logos.parent(), function (el) {
                console.log($(el).height());
            });

            return this;
        }

    });

});
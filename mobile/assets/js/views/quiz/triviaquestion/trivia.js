/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/quiz/triviaquestion/correctanswer'
], function ($, _, Backbone, Kinvey, App, CorrectAnswerView) {

    "use strict";

    return Backbone.View.extend({

        className: 'trivia',
        template: App.getTemplate('quiz-triviaquestion-trivia'),

        initialize: function () {
            this._templateVars = {
                correctLogo: this.model.get('advertiserLogo'),
                question: this.model.get('question').question
            };

            this.listenTo(this.model, 'guess:correcttrivia', this._renderCorrectAnswer);
        },

        render: function () {
            this.$el.html(this.template(this._templateVars));
            return this;
        },

        _renderCorrectAnswer: function () {
            console.log('_renderCorrectAnswer invoked');
            var correctAnswerView = new CorrectAnswerView({
                model: this.model
            });

            this.$el.find('.js-triviaquestion-trivia-question')
                .append(correctAnswerView.render().el);
        }

    });

});
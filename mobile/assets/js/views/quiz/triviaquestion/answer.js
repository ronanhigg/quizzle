/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app'
], function ($, _, Backbone, Kinvey, App) {

    "use strict";

    return Backbone.View.extend({

        className: 'answer',
        template: App.getTemplate('quiz-triviaquestion-answer'),

        events: {
            'click .js-triviaquestion-guess': '_guess'
        },

        initialize: function () {
            var answers,
                triviaQuestion = this.model.get('question');

            answers = [
                triviaQuestion.correct_answer,
                triviaQuestion.incorrect_answer_1,
                triviaQuestion.incorrect_answer_2,
                triviaQuestion.incorrect_answer_3
            ];
            answers = _.shuffle(answers);

            this._correctIndex = _.indexOf(answers, triviaQuestion.correct_answer);

            this._templateVars = {
                answers: answers
            };
        },

        render: function () {
            this.$el.html(this.template(this._templateVars));
            return this;
        },

        _guess: function (event) {
            var selectedIndex = $(event.currentTarget).data('index');

            if (selectedIndex === this._correctIndex) {
                this.model.trigger('guess:correcttrivia');
                App.player.trigger('points:trivia');
            } else {
                this.model.trigger('guess:incorrect');
            }

            this.remove();

            return false;
        }

    });

});
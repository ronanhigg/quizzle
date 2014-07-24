/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'vendor/textFit.mod',
    'app'
], function ($, _, Backbone, Kinvey, FitText, App) {

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

            this.$el.find('.js-triviaquestion-guess').each(function () {
                var $this = $(this);

                var interval = setInterval(function () {
                    if ($this.width() > 0) {
                        clearInterval(interval);
                        FitText($this, {
                            minFontSize: 10,
                            maxFontSize: 48,
                            alignVert: true,
                            alignHoriz: true,
                            multiLine: true
                        });
                    }
                }, 50);
            });

            return this;
        },

        _guess: function (event) {
            var selectedIndex = $(event.currentTarget).data('index');

            if (selectedIndex === this._correctIndex) {
                App.playSound('correct');
                this.model.trigger('guess:correcttrivia');
                App.player.trigger('points:trivia');
            } else {
                App.playSound('incorrect');
                this.model.trigger('guess:incorrect');
            }

            this.remove();

            return false;
        }

    });

});
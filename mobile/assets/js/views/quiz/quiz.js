/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/quiz/countdown',
    'views/quiz/failure',
    'views/quiz/footer',
    'views/quiz/logoquestion',
    'views/quiz/screenshot',
    'views/quiz/success',
    'views/quiz/triviamissing',
    'views/quiz/triviaquestion',
    'views/guess-response'
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    CountdownView,
    FailureView,
    FooterView,
    LogoQuestionView,
    ScreenshotView,
    SuccessView,
    TriviaMissingView,
    TriviaQuestionView,
    GuessResponseView
) {

    "use strict";

    return Backbone.View.extend({

        className: 'quiz js-stream',
        template: App.getTemplate('quiz'),

        events: {
        },

        initialize: function (options) {
            this.children = [];

            if (!this.model.get('noAdData')) {
                this.children.push(new CountdownView({
                    model: this.model
                }));

                this.children.push(new ScreenshotView({
                    model: this.model
                }));

                this.children.push(new LogoQuestionView({
                    model: this.model
                }));
            }

            this.children.push(new FooterView({
                model: this.model,
                index: options.index
            }));

            this.listenTo(this.model, 'guess:correctlogo', this._renderLogoSuccess);
            this.listenTo(this.model, 'guess:correcttrivia', this._renderTriviaSuccess);
            this.listenTo(this.model, 'guess:incorrectlogo', this._renderLogoFailure);
            this.listenTo(this.model, 'guess:incorrecttrivia', this._renderTriviaFailure);
        },

        render: function () {
            var self = this;

            this.$el.attr('data-id', this.model.get('_id'));

            _.each(this.children, function (child) {
                self.$el.append(child.render().el);
            });

            return this;
        },

        _renderLogoSuccess: function () {
            if (!$.contains(document.body, $('.js-guess-response'))) {
                this._renderGuessResponse({
                    messageExcl: 'Awesome!',
                    messageNext: 'You\'ve unlocked a trivia question',
                    messagePoints: 'Plus, you get',
                    points: App.player.logoPoints,
                    action: 'Alright!'
                });
            }

            if (this.model.get('has_quiz_data') && this.model.get('question').question === undefined) {
                console.log('[QUIZ] Data not here yet...');
                var _this = this;
                setTimeout(function () {
                    _this._renderLogoSuccess();
                }, 100);
                return;
            }

            if (this.model.get('noQuizData')) {
                console.log('[QUIZ] no quiz data...');
                var view = new TriviaMissingView();

            } else {
                var view = new TriviaQuestionView({
                    model: this.model
                });
            }

            this.$el.find('.js-quiz-footer')
                .before(view.render().el);
        },

        _renderTriviaSuccess: function () {
            this._renderGuessResponse({
                messageExcl: 'Excellent!',
                messageNext: 'You\'ve completed this Quizzle',
                messagePoints: 'You got another',
                points: App.player.triviaPoints,
                action: 'Try the next Quizzle!'
            });

            var successView = new SuccessView();

            this.$el.find('.js-quiz-footer')
                .before(successView.render().el);
        },

        _renderLogoFailure: function () {
            this._renderGuessResponse({
                messageExcl: 'Too bad!',
                messageNext: 'Pay attention at the next ad break and you might get it!',
                action: 'Try the next Quizzle'
            });

            var failureView = new FailureView();

            this.$el.find('.js-quiz-footer')
                .before(failureView.render().el);
        },

        _renderTriviaFailure: function () {
            this._renderGuessResponse({
                messageExcl: 'Tough luck!',
                messageNext: 'You might get it the next time around.',
                action: 'Try the next Quizzle'
            });

            var failureView = new FailureView();

            this.$el.find('.js-quiz-footer')
                .before(failureView.render().el);
        },

        _renderGuessResponse: function (options) {
            var popup = new GuessResponseView(options);
            $('body').append(popup.render().el);
        }

    });

});
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
    'views/quiz/triviaquestion'
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
    TriviaQuestionView
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

            this.listenTo(this.model, 'guess:correctlogo', this._renderTriviaQuestion);
            this.listenTo(this.model, 'guess:correcttrivia', this._renderPoints);
            this.listenTo(this.model, 'guess:incorrectlogo', this._renderLogoFailureViews);
            this.listenTo(this.model, 'guess:incorrecttrivia', this._renderTriviaFailureViews);
        },

        render: function () {
            var self = this;

            this.$el.attr('data-id', this.model.get('_id'));

            _.each(this.children, function (child) {
                self.$el.append(child.render().el);
            });

            return this;
        },

        _renderTriviaQuestion: function () {
            var view;

            if (this.model.get('has_quiz_data') && this.model.get('question').question === undefined) {
                console.log('[QUIZ] Data not here yet...');
                var that = this;
                setTimeout(function () {
                    that._renderTriviaQuestion();
                }, 100);
                return;
            }

            if (this.model.get('noQuizData')) {
                console.log('[QUIZ] no quiz data...');
                view = new TriviaMissingView();

            } else {
                view = new TriviaQuestionView({
                    model: this.model
                });
            }

            this.$el.find('.js-quiz-footer')
                .before(view.render().el);
        },

        _renderPoints: function () {
            var successView = new SuccessView();

            this.$el.find('.js-quiz-footer')
                .before(successView.render().el);
        },

        _renderLogoFailureViews: function () {
            var failureView = new FailureView();

            this.$el.find('.js-quiz-footer')
                .before(failureView.render().el);
        },

        _renderTriviaFailureViews: function () {
            var failureView = new FailureView();

            this.$el.find('.js-quiz-footer')
                .before(failureView.render().el);
        }

    });

});
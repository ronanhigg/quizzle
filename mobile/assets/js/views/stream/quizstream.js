/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/loading',
    'views/quiz/quiz',
    'views/stream/errormessage',
    'views/stream/streamaction',
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    LoadingView,
    QuizView,
    ErrorMessageView,
    StreamActionView
) {

    "use strict";

    return Backbone.View.extend({

        _loadingView: undefined,
        _errorMessageView: undefined,

        className: 'quiz-container js-stream',

        events: {
        },

        initialize: function (options) {
            this.listenTo(this.collection, 'add', this._renderQuiz);
            this.listenTo(this.collection, 'fetch:updated', this._renderLoadMore);
            this.listenTo(this.collection, 'fetch:request', this._renderLoading);
            this.listenTo(this.collection, 'fetch:nomodels', this._renderNoModelsError);
            this.listenTo(this.collection, 'fetch:succeeded', this._removeLoading);
            this.listenTo(this.collection, 'fetch:failed', this._renderConnectionError);
            this.listenTo(App.EventBus, 'stream:next', this._jumpToNextQuiz);
        },

        render: function () {
            if (this.collection.isEmpty()) {
                this._renderLoading();
            } else {
                this._renderQuizzes();
            }
            return this;
        },

        _renderQuizzes: function () {
            var that = this;
            this.collection.forEach(function (model) {
                that._renderQuiz(model, that.collection);
            });

            this._renderLoadMore();
        },

        _renderQuiz: function (adDetection, adDetections) {
            var quizView = new QuizView({
                model: adDetection,
                index: adDetections.indexOf(adDetection)
            });

            //this.$el.find('.js-quizzes').append(quizView.render().el);
            this.$el.append(quizView.render().el);
        },

        _renderNoModelsError: function () {
            this._renderError('There appears to be no more ads to load');
        },

        _renderConnectionError: function (xhr) {
            this._renderError('There was a connection problem and no quizzes could be retrieved', xhr);
        },

        _renderError: function (message, xhr) {
            var streamActionView = new StreamActionView({
                'collection': this.collection,
                'label': 'Try Again',
                'action': 'try-again'
            });

            this._errorMessageView = new ErrorMessageView({
                message: message,
                details: xhr
            });

            this._removeLoading();

            this.$el
                .append(this._errorMessageView.render().el)
                .append(streamActionView.render().el);
        },

        _renderLoadMore: function () {
            var streamActionView = new StreamActionView({
                'collection': this.collection,
                'label': 'Load More',
                'action': 'load-more'
            });

            this.$el.append(streamActionView.render().el);
        },

        _renderLoading: function () {
            var options = {};

            this._removeErrorMessage();

            if (this.collection.isEmpty()) {
                options = {
                    fullScreen: true
                };
            }

            this._loadingView = new LoadingView();

            this._loadingView.render(options);
            this.$el.append(this._loadingView.el);
        },

        _removeLoading: function () {
            if (this._loadingView !== undefined) {
                this._loadingView.remove();
                this._loadingView = undefined;
            }
        },

        _removeErrorMessage: function () {
            if (this._errorMessageView !== undefined) {
                this._errorMessageView.remove();
                this._errorMessageView = undefined;
            }
        },

        _jumpToNextQuiz: function (currentQuizId) {
            var $currentQuiz = this.$el.find('.js-stream[data-id="' + currentQuizId + '"]');
            var $nextQuiz = $currentQuiz.next('.js-stream');

            if ($nextQuiz.length > 0) {
                $('html, body').scrollTop($nextQuiz.offset().top - 60);
            } else {
                this.$el.find('.js-stream-action').trigger('click');
            }
        }

    });

});
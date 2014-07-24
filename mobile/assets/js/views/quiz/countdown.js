/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'moment',
    'kinvey',
    'app'
], function ($, _, Backbone, moment, Kinvey, App) {

    "use strict";

    var setupAnimation = function (view) {

        var view = view;
        var reductionPerPeriod;
        var currentWidth;

        var isAnimationInitialised = function () {
            return currentWidth !== undefined;
        }

        var initialseAnimation = function (currentPeriod, $progress) {
            var width = $progress.width();
            reductionPerPeriod = width / App.countdown.TOTAL_PERIODS;
            currentWidth = width - (currentPeriod * reductionPerPeriod);
        };

        var animate = function ($progress) {
            currentWidth = currentWidth - reductionPerPeriod;
            $progress.width(currentWidth);
        }

        return (function () {
            var $progress = view.$el.find('.js-progress');
            var currentPeriod = App.countdown.getInitialPeriod(view.model);

            if (App.countdown.isAnimationComplete(currentPeriod)) {
                $progress.width(0);
                return function () {};
            }

            return function () {

                if (App.countdown.isAnimationComplete(currentPeriod)) {
                    return;
                }

                if ( ! isAnimationInitialised()) {
                    initialseAnimation(currentPeriod, $progress);
                }

                animate($progress);
                currentPeriod++;

            };

        })();
    };

    return Backbone.View.extend({

        className: 'countdown',
        template: App.getTemplate('quiz-countdown'),

        initialize: function () {
            this.listenTo(App.EventBus, 'ticker:countdown', this._renderNext);
        },

        render: function () {
            this.$el.html(this.template());
            this._tick = setupAnimation(this);
            return this;
        },

        _renderNext: function () {
            this._tick();
        },

    });

});
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

        var TOTAL_SECONDS = 60 * 30;
        var PERIODS_PER_SECOND = 20;
        var TOTAL_PERIODS = TOTAL_SECONDS * PERIODS_PER_SECOND;
        var INTERVAL = 1000 / PERIODS_PER_SECOND;

        var view = view;
        var reductionPerPeriod;
        var currentWidth;

        var getInitialPeriod = function () {
            return TOTAL_PERIODS - (getInitialSeconds() * PERIODS_PER_SECOND);
        };

        var getInitialSeconds = function () {
            // TODO - Figure out why the time is off by an hour
            var now = moment().subtract('hour', 1);
            var startingAt = getStartingAt();

            var seconds = TOTAL_SECONDS - now.diff(startingAt, 'seconds');
            // TESTING - Comment out the line below to set all progress bars to
            //           have 10 seconds remaining.
            //seconds = 10;

            if (seconds < 0) {
                seconds = 0;
            }

            return seconds;
        };

        var getStartingAt = function () {
            var startingAt = view.model.get('broadcast_starting_at');
            return moment(startingAt, 'YYYYMMDD[T]HHmmss[Z]');
        };

        var isAnimationInitialised = function () {
            return currentWidth !== undefined;
        }

        var initialseAnimation = function (currentPeriod, $progress) {
            var width = $progress.width();
            reductionPerPeriod = width / TOTAL_PERIODS;
            currentWidth = width - (currentPeriod * reductionPerPeriod);
        };

        var animate = function ($progress) {
            currentWidth = currentWidth - reductionPerPeriod;
            $progress.width(currentWidth);
        }

        var isAnimationComplete = function (currentPeriod) {
            return TOTAL_PERIODS <= currentPeriod;
        };

        (function () {
            var $progress = view.$el.find('.js-progress');
            var currentPeriod = getInitialPeriod();

            var intervalClient = setInterval(function () {

                if ( ! isAnimationInitialised()) {
                    initialseAnimation(currentPeriod, $progress);
                }

                animate($progress);
                currentPeriod++;

                if (isAnimationComplete(currentPeriod)) {
                    clearInterval(intervalClient);
                }
            }, INTERVAL);
        })();
    };

    return Backbone.View.extend({

        className: 'countdown',
        template: App.getTemplate('quiz-countdown'),

        render: function () {
            this.$el.html(this.template());
            setupAnimation(this);
            return this;
        }

    });

});
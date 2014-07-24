/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'app'
], function (_, Backbone, App) {

    "use strict";

    return function () {

        this.TOTAL_SECONDS = 60 * 10;
        this.PERIODS_PER_SECOND = 20;
        this.TOTAL_PERIODS = this.TOTAL_SECONDS * this.PERIODS_PER_SECOND;

        this.setup = function () {
            var interval = 1000 / this.PERIODS_PER_SECOND;

            setInterval(function () {
                App.EventBus.trigger('ticker:countdown');
            }, interval);
        };

        this.isAnimationComplete = function (currentPeriod) {
            return this.TOTAL_PERIODS <= currentPeriod;
        };

        this.getInitialPeriod = function (model) {
            return this.TOTAL_PERIODS - (_getInitialSeconds(model) * this.PERIODS_PER_SECOND);
        };

        var _this = this;

        var _getInitialSeconds = function (model) {
            // TODO - Figure out why the time is off by an hour
            var now = moment().subtract('hour', 1);
            var startingAt = _getStartingAt(model);

            var seconds = _this.TOTAL_SECONDS - now.diff(startingAt, 'seconds');
            // TESTING - Comment out the line below to set all progress bars to
            //           have 10 seconds remaining.
            //seconds = 10;

            if (seconds < 0) {
                seconds = 0;
            }

            return seconds;
        };

        var _getStartingAt = function (model) {
            var startingAt = model.get('broadcast_starting_at');
            return moment(startingAt, 'YYYYMMDD[T]HHmmss[Z]');
        };

    }
});
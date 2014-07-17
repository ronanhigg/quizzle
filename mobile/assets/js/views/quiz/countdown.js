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

    return Backbone.View.extend({

        className: 'countdown',
        template: App.getTemplate('quiz-countdown'),

        render: function () {
            this.$el.html(this.template());

            var totalWidth, reductionPerPeriod, currentWidth;
            var $progress = this.$el.find('.js-progress');

            var maxSeconds = 1800;

            var now = moment().subtract('hour', 1);
            var startingAt = moment(this.model.get('broadcast_starting_at'), 'YYYYMMDD[T]HHmmss[Z]');
            var totalSeconds = maxSeconds - now.diff(startingAt, 'seconds');
            //var totalSeconds = 10;

            if (totalSeconds < 0) {
                totalSeconds = 0;
            }

            var maxPeriods = maxSeconds * 20;
            var totalPeriods = totalSeconds * 20;
            var missingPeriods = maxPeriods - totalPeriods;

            var i = missingPeriods;

            var interval = setInterval(function () {

                if (i === missingPeriods) {

                    totalWidth = $progress.width();
                    reductionPerPeriod = totalWidth / maxPeriods;

                    currentWidth = totalWidth - (missingPeriods * reductionPerPeriod)
                }

                currentWidth = currentWidth - reductionPerPeriod;
                $progress.width(currentWidth);

                i++;
                if (maxPeriods <= i) {
                    clearInterval(interval);
                }
            }, 50);

            return this;
        }

    });

});
/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',
    'loader',
    'views/checkin/airing'
], function ($, _, Backbone, Kinvey, App, Loader, CheckInAiringView) {

    "use strict";

    return Backbone.View.extend({

        className: 'checkin',
        template: App.getTemplate('checkin'),

        events: {
            "click .checkin-submit": "submitCheckIns"
        },

        initialize: function (options) {
            var _this = this;

            this.children = [];

            options.airings.each(function (airing) {
                var checkInsForAiring, checkIn;

                checkInsForAiring = options.checkIns.byAiring(airing);
                checkIn = checkInsForAiring.pop();

                _this.children.push(new CheckInAiringView({
                    airing: airing,
                    checkIn: checkIn
                }));
            });

        },

        render: function () {
            var _this = this;

            this.$el.html(this.template());

            _.each(this.children, function (child) {
                child.render().$el.appendTo(_this.$('#checkin-airings'));
                //_this.$('#checkin-airings').append(child.render().$el.html());
            });

            return this;
        },

        submitCheckIns: function () {
            var initialCheckInIDs,
                deletionQuery = new Kinvey.Query();

            initialCheckInIDs = App.initialCheckIns
                .filter(function (initialCheckIn) {
                    return !App.checkins.contains(initialCheckIn);
                })
                .map(function (initialCheckIn) {
                    return initialCheckIn.get('_id');
                });

            deletionQuery.contains('_id', initialCheckInIDs);

            App.checkins.each(function (checkIn) {
                checkIn.save();
            });

            App.checkins.clean({
                query: deletionQuery
            });

            App.router.navigate('stream', {
                trigger: true
            });

            return false;
        }

    });

});
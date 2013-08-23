/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'moment',
    'app',
    'models/checkin'
], function ($, _, Backbone, moment, App, CheckInModel) {

    "use strict";

    return Backbone.View.extend({

        tagName: 'a',
        className: 'checkin-airing list-group-item',
        attributes: {
            href: '#'
        },

        template: App.getTemplate('checkin-airing'),

        events: {
            //"click .checkin-airing": "toggleSelected"
            "click": "toggleSelected"
        },

        initialize: function () {
            if (this.options.checkIn !== undefined) {
                this.listenTo(this.options.checkIn, 'change', this.render);
            }
        },

        render: function () {

            var startingAt = this.options.airing.get('starting_at'),
                finishingAt = this.options.airing.get('finishing_at');

            startingAt = moment(startingAt.toString(), "X");
            finishingAt = moment(finishingAt.toString(), "X");

            startingAt = startingAt.format('HH:mm');
            finishingAt = finishingAt.format('HH:mm');


            this.$el.html(this.template({
                'channel': this.options.airing.get('channel'),
                'show': this.options.airing.get('show'),
                'startingAt': startingAt,
                'finishingAt': finishingAt
            }));

            if (this.options.checkIn !== undefined) {
                this.$el.addClass('active');
            } else {
                this.$el.removeClass('active');
            }

            return this;
        },

        toggleSelected: function () {

            if (this.options.checkIn === undefined) {

                this.options.checkIn = new CheckInModel({
                    is_active: true,
                    is_manual: true,
                    airing: this.options.airing,
                    player: App.player
                });
                App.checkins.push(this.options.checkIn);

            } else {
                App.checkins.remove(this.options.checkIn);
                delete this.options.checkIn;
            }
                
            this.render();

            return false;
        }

    });

});
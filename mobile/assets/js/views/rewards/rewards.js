/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/quiz/failure'
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    FailureView
) {

    "use strict";

    return Backbone.View.extend({

        className: 'rewards',
        template: App.getTemplate('rewards'),

        events: {
            'click .js-redeem-reward': '_redeemReward'
        },

        initialize: function (options) {
        },

        render: function () {
            console.log(this.collection);
            this.$el.html(this.template({
                'rewards': this.collection
            }));
            return this;
        },

        _redeemReward: function (event) {
            event.preventDefault();
            App.EventBus.trigger('message', 'Reward redemption is not yet implemented.');
        }

    });

});
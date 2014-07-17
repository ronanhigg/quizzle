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

            var reward = this.collection.findWhere({
                shortCode: $(event.currentTarget).data('short-code')
            });

            App.gamesparks.sendWithData('BuyVirtualGoodsRequest', {
                'currencyType': 1,
                'quantity': 1,
                'shortCode': reward.get('shortCode')
            }, function (response) {
                console.log(response);
                if (response.error) {
                    if (response.error.currency1 === "INSUFFICIENT_FUNDS") {
                        App.EventBus.trigger('message', 'You haven\'t earned enough points to redeem this reward.');
                        return;
                    }

                    App.EventBus.trigger('message', 'There was an error attempting to redeem your reward.');
                    return;
                }

                App.EventBus.trigger('message', 'You have successfully redeemed the ' + reward.get('name') + ' reward.');
                App.EventBus.trigger('cash:spend', reward.get('currency1Cost'));
            });
        }
    });

});
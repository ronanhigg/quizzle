/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/popup',
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    PopupView
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
            this.$el.html(this.template({
                'rewards': this.collection
            }));

            $('body').scrollTop(0);
            $('.js-loader').remove();

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
                        var popupView = new PopupView({
                            template: 'reward-unavailable-popup',
                            name: reward.get('name')
                        });
                        $('body').append(popupView.render().el);
                        return;
                    }

                    App.EventBus.trigger('message', 'There was an error attempting to redeem your reward.');
                    return;
                }

                App.playSound('purchase');
                var popupView = new PopupView({
                    template: 'reward-purchased-popup',
                    name: reward.get('name'),
                    cost: reward.get('currency1Cost')
                });
                $('body').append(popupView.render().el);

                //App.EventBus.trigger('message', 'You have successfully redeemed the ' + reward.get('name') + ' reward.');
                App.EventBus.trigger('cash:spend', reward.get('currency1Cost'));
            });
        }
    });

});
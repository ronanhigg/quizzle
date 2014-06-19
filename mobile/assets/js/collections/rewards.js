/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'app',
    'vendor/async',
    'models/reward'
], function (
    $,
    _,
    Backbone,
    App,
    Async,
    RewardModel
) {

    "use strict";

    return Backbone.Collection.extend({

        model: RewardModel,

        initialize: function () {
            var self = this;
        },

        fetch: function (callback) {
            var self = this;

            App.gamesparks.listVirtualGoodsRequest(function (response) {
                for (var i = 0; i < response.virtualGoods.length; i++) {
                    self.add(new RewardModel(response.virtualGoods[i]));
                }
                callback();
            });
        },

    });

});
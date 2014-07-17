/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'app',
], function (_, Backbone, App) {

    "use strict";

    return Backbone.Model.extend({

        logoPoints: 100,
        triviaPoints: 200,

        initialize: function () {
            this.on('points:logo', this._addLogoPoints);
            this.on('points:trivia', this._addTriviaPoints);
        },

        isLoggedIn: function () {
            return this.id !== undefined;
        },

        isConnectedToSocialLogin: function () {
            return this.connectedToFacebook || this.connectedToTwitter;
        },

        _addLogoPoints: function () {
            this._addPoints(this.logoPoints);
            App.gamesparks.logLogoPointsRequest(this.logoPoints);
        },

        _addTriviaPoints: function () {
            this._addPoints(this.triviaPoints);
            App.gamesparks.logTriviaPointsRequest(this.triviaPoints);
        },

        _addPoints: function (pointsEarned) {
            var newPoints = this.get('points') + pointsEarned;
            var newCash = this.get('cash') + pointsEarned;
            this.set('points', newPoints);
            this.set('cash', newCash);
            App.EventBus.trigger('points:change', newPoints);
            App.EventBus.trigger('cash:change', newCash);
        }

    });
    
});
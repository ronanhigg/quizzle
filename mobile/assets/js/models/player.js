/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'facebook',
    'app',
], function (_, Backbone, FB, App) {

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
            var newPoints = this.get('points') + pointsEarned
            this.set('points', newPoints);
            App.EventBus.trigger('points:change', newPoints);
        }

    });
    
});
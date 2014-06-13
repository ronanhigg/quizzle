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

        connectToFacebook: function () {
            var _this = this;
            if (this.get('connectedToFacebook')) {
                App.EventBus.trigger('message', 'Your account is already connected to Facebook');
            } else {
                FB.login(function(response) {
                    if (response.status === 'connected') {
                        App.gamesparks.facebookConnectRequest(response.authResponse.accessToken, null, function (response) {
                            console.log(response);
                            console.log('connected account to facebook')
                            _this.set('connectedToFacebook', true);
                        });
                    }
                });
            }
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
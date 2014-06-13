/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'facebook',
    'app',

    'models/player'
], function (_, Backbone, FB, App, PlayerModel) {

    "use strict";

    return function () {
        this.build = function (callback) {

            var playerData = {};

            App.async.series([
                function (asyncCallback) {
                    App.gamesparks.sendWithData('AccountDetailsRequest', {}, function (response) {

                        if (response.error && response.error.authentication == 'NOTAUTHORIZED') {
                            App.router.navigate('login', {
                                trigger: true
                            });
                            return;
                        }

                        playerData.userId = response.userId;
                        playerData.name = response.displayName;
                        playerData.points = 0;

                        if (response.scriptData && response.scriptData.points) {
                            playerData.points = response.scriptData.points;
                        }

                        asyncCallback();
                    });
                },
                function (asyncCallback) {
                    FB.getLoginStatus(function(response) {
                        playerData.connectedToFacebook = false;
                        if (response.status === 'connected') {
                            playerData.connectedToFacebook = true;
                        }

                        asyncCallback();
                    });
                },
                function (asyncCallback) {
                    if ( ! playerData.connectedToFacebook) {
                        playerData.photo = '/assets/img/profile.jpg';
                        asyncCallback();
                        return;
                    }

                    FB.api('/me/picture', {
                        'type': 'square',
                        'width:': 100
                    }, function(response) {
                        if (response && !response.error) {
                            console.log(response.data.url);
                            playerData.photo = response.data.url;
                        } else {
                            console.log(response);
                        }

                        asyncCallback();
                    });
                }
            ], function () {
                App.player = new PlayerModel(playerData);
                App.EventBus.trigger('player:loaded');
                console.log(App.player);

                callback();
            });
        };
    };
    
});
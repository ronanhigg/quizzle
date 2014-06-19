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

    var isPlayerBeingBuilt = false;

    return function () {

        this.build = function (provider, oauthResult, callback) {

            if (isPlayerBeingBuilt) {
                console.log('[PBLD] A Player model is already being built.');
                callback();
                return;
            }

            if (App.player) {
                console.log('[PBLD] A Player model has already been built.');
                callback();
                return;
            }

            isPlayerBeingBuilt = true;

            console.log('[PBLD] Attempting to build Player model');

            var playerData = {
                connectedToFacebook: false,
                connectedToTwitter: false
            };

            App.async.series([
                function (asyncCallback) {

                    if (provider === 'facebook') {
                        console.log('[PBLD] Making Facebook connection request to GameSparks');

                        App.gamesparks.sendWithData('FacebookConnectRequest', {
                            'accessToken': oauthResult.access_token
                        }, function (response) {
                            console.log('[PBLD] GameSparks Facebook connection response');
                            console.log(response);
                            if (response.error) {
                                console.log('[PBLD] Error connecting to GameSparks account with Facebook');
                            } else {
                                console.log('[PBLD] Connected to GameSparks account with Facebook');
                                playerData.connectedToFacebook = true;
                            }
                            asyncCallback();
                        });

                        return;
                    }

                    if (provider === 'twitter') {
                        console.log('[PBLD] Making Twitter connection request to GameSparks');

                        App.gamesparks.sendWithData('TwitterConnectRequest', {
                            'accessToken': oauthResult.oauth_token,
                            'accessSecret': oauthResult.oauth_token_secret
                        }, function (response) {
                            console.log('[PBLD] GameSparks Twitter connection response');
                            console.log(response);
                            if (response.error) {
                                console.log('[PBLD] Error connecting to GameSparks account with Twitter');
                                App.auth.logout();
                            } else {
                                console.log('[PBLD] Connected to GameSparks account with Twitter');
                                playerData.connectedToTwitter = true;
                            }
                            asyncCallback();
                        });

                        return;
                    }

                    console.error('[PBLD] Invalid provider given to Player Factory');
                    asyncCallback();
                },
                function (asyncCallback) {
                    console.log('[PBLD] Making account details request to GameSparks');
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

                    console.log('[PBLD] Attempting to set Player profile photo');

                    if (playerData.connectedToFacebook) {
                        console.log('[PBLD] Making request to Facebook for profile photo');
                        oauthResult.get('/me/picture', {
                            'data': {
                                'redirect': false,
                                'type': 'square'
                            }
                        })
                            .done(function (response) {
                                if (response && !response.error) {
                                    playerData.photo = response.data.url;
                                } else {
                                    console.log(response);
                                }
                                asyncCallback();
                            });

                        return;
                    }

                    if (playerData.connectedToTwitter) {
                        console.log('[PBLD] Making request to Twitter for profile photo');
                        console.log(oauthResult);
                        oauthResult.me()
                            .done(function (response) {
                                console.log(response);
                                if (response && !response.error) {
                                    playerData.photo = response.avatar;
                                } else {
                                    console.log(response);
                                }
                                asyncCallback();
                            });

                        return;
                    }

                    console.log('[PBLD] Using default profile photo');

                    playerData.photo = '/assets/img/user.png';
                    asyncCallback();
                }
            ], function () {
                isPlayerBeingBuilt = false;
                App.player = new PlayerModel(playerData);
                App.EventBus.trigger('player:loaded');
                console.log(App.player);

                callback();
            });
        };
    };
    
});
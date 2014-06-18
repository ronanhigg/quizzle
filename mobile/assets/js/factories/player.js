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

        this.build = function (provider, oauthResult, callback) {

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
                /*function (asyncCallback) {
                    console.log('facebook connect attempt');
                    if (fbAccessToken === undefined) {
                        return asyncCallback();
                    }

                    console.log('facebook connect execution');
                    App.gamesparks.sendWithData('FacebookConnectRequest', {
                        'accessToken': fbAccessToken
                    }, function (response) {
                        playerData.connectedToFacebook = true;
                        asyncCallback();
                    });
                },
                function (asyncCallback) {
                    console.log('twitter connect attempt');
                    if (twAccessTokens === undefined) {
                        return asyncCallback();
                    }
                    
                    console.log('twitter connect execution');
                    App.gamesparks.sendWithData('TwitterConnectRequest', {
                        'accessToken': twAccessTokens.accessToken,
                        'accessSecret': twAccessTokens.accessSecret
                    }, function (response) {
                        console.log(response);
                        playerData.connectedToTwitter = true;
                        asyncCallback();
                    });
                },*/
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
                    /*if ( ! playerData.connectedToFacebook) {
                        playerData.photo = '/assets/img/user.png';
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
                    });*/


                    if (playerData.connectedToFacebook) {
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

                    playerData.photo = '/assets/img/user.png';
                    asyncCallback();
                }
            ], function () {
                App.player = new PlayerModel(playerData);
                App.EventBus.trigger('player:loaded');
                console.log(App.player);

                callback();
            });
        };

        this.buildFacebookPlayer = function (fbAccessToken, callback) {
            console.log('[DEPRECATED] buildFacebookPlayer');
            //build(fbAccessToken, undefined, callback);
        }

        this.buildTwitterPlayer = function (twAccessTokens, callback) {
            console.log('[DEPRECATED] buildTwitterPlayer');
            //console.log('called buildTwitterPlayer');
            //build(undefined, twAccessTokens, callback);
        };

        /*this.buildForManual = function (callback) {

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
        };*/
    };
    
});
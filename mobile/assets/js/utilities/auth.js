/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'facebook',
    'app'
], function (_, Backbone, FB, App) {

    "use strict";

    return function () {

        this.contextualExec = function (loggedInCallback, loggedOutCallback) {
            console.log('[AUTH] Checking if player is authenticated');

            if (App.player && App.player.get('connectedToFacebook')) {
                console.log('[AUTH] Player is authenticated locally');
                loggedInCallback();
                return;
            }

            var oauthResult = App.oauth.create('facebook');

            if (oauthResult.access_token) {
                console.log('[AUTH] Player is authenticated via Facebook');
                App.playerFactory.build('facebook', oauthResult, loggedInCallback);
                return;
            }

            oauthResult = App.oauth.create('twitter');

            if (oauthResult.oauth_token) {
                console.log('[AUTH] Player is authenticated via Twitter');
                App.playerFactory.build('twitter', oauthResult, loggedInCallback);
                return;
            }

            console.log('[AUTH] Player is NOT authenticated');
            loggedOutCallback();
        };

        this.setupOAuthCallbacks = function () {
            console.log('[AUTH] Setting up OAuth callbacks');

            App.oauth.callback('facebook', {
                'cache': true
            }, function (err, result) {
                console.log('[AUTH] Facebook authentication callback');
                console.log(err);
                console.log(result);

                if (result && result.access_token) {
                    console.log('[AUTH] Facebook OAuth token received');

                    App.playerFactory.build('facebook', result, function () {
                        /*App.router.navigate('play', {
                            trigger: true
                        });*/
                    });

                } else {
                    //App.EventBus.trigger('message', 'Facebook authorization declined');
                }
            });

            App.oauth.callback('twitter', {
                'cache': true
            }, function (err, result) {
                console.log('[AUTH] Twitter authentication callback');
                console.log(err);
                console.log(result);

                if (result && result.oauth_token) {
                    console.log('[AUTH] Twitter OAuth token received');

                    App.playerFactory.build('twitter', result, function () {
                        /*App.router.navigate('play', {
                            trigger: true
                        });*/
                    });

                } else {
                    //App.EventBus.trigger('message', 'Twitter authorization declined');
                }
            });
        };

        this.logout = function () {
            console.log('[AUTH] Logging out player');

            App.oauth.clearCache('facebook');
            App.oauth.clearCache('twitter');

            App.player = undefined;

            App.EventBus.trigger('menu:hide');
            App.EventBus.trigger('player:unloaded');

            App.router.navigate('', {
                trigger: true
            });
        };
    };
    
});
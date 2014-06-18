/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'models/player',
    'models/session'
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    PlayerModel,
    SessionModel
) {

    "use strict";

    return Backbone.View.extend({

        className: 'login',
        template: App.getTemplate('login'),

        events: {
            'submit .js-login-form': '_login',
            'click .js-connect-facebook': '_connectToFacebook',
            'click .js-connect-twitter': '_connectToTwitter'
        },

        initialize: function (options) {
        },

        render: function () {
            this.$el.html(this.template({
            }));
            return this;
        },

        /*_login: function () {

            App.gamesparks.authenticationRequest($('#password').val(), $('#username').val(), function (response) {

                if (response.error) {
                    App.EventBus.trigger('message', 'Invalid login credentials');
                    return;
                }

                App.session.save({
                    'authToken': App.gamesparks.getAuthToken(),
                });

                App.playerFactory.build(function () {
                    App.router.navigate('play', {
                        trigger: true
                    });
                });

            });

            return false;
        },*/

        _connectToFacebook: function (event) {
            event.preventDefault();

            /*FB.login(function(response) {
                if (response.status === 'connected') {
                    App.playerFactory.buildFacebookPlayer(response.authResponse.accessToken, function () {
                        App.router.navigate('play', {
                            trigger: true
                        });
                    });
                }
            });*/
            console.log('[AUTH] Attempting to authenticate via Facebook');
            App.oauth.popup('facebook', {
                'cache': true
            }, function (err, result) {
                console.log('[AUTH] Facebook authentication callback');
                console.log(err);
                console.log(result);
                if (result.access_token) {
                    App.playerFactory.build('facebook', result, function () {
                    //App.playerFactory.buildFacebookPlayer(result.access_token, function () {
                        App.router.navigate('play', {
                            trigger: true
                        });
                    });
                } else {
                    App.EventBus.trigger('message', 'Facebook authorization declined');
                }
            });

            /*App.oauth.callback('facebook', {
                'cache': true
            }, function (err, result) {
                console.log(err);
                console.log(result);
                if (result.access_token) {
                    App.playerFactory.build('facebook', result, function () {
                    //App.playerFactory.buildFacebookPlayer(result.access_token, function () {
                        App.router.navigate('play', {
                            trigger: true
                        });
                    });
                } else {
                    App.EventBus.trigger('message', 'Facebook authorization declined');
                }
            });*/
        },

        _connectToTwitter: function (event) {
            event.preventDefault();
            //App.EventBus.trigger('message', 'Twitter social connection is not yet implemented');

            /*App.oauth.callback('twitter', {
                'cache': true
            }, function (err, result) {
                console.log(err);
                console.log(result);
                if (result.oauth_token) {
                    App.playerFactory.build('twitter', result, function () {
                        App.router.navigate('play', {
                            trigger: true
                        });
                    });
                } else {
                    App.EventBus.trigger('message', 'Twitter authorization declined');
                }
            });*/

            console.log('[AUTH] Attempting to authenticate via Twitter');
            App.oauth.popup('twitter', {
                'cache': true
            }, function (err, result) {
                console.log('[AUTH] Twitter authentication callback');
                console.log(err);
                console.log(result);
                if (result.oauth_token) {
                    App.playerFactory.build('twitter', result, function () {
                        App.router.navigate('play', {
                            trigger: true
                        });
                    });
                } else {
                    App.EventBus.trigger('message', 'Twitter authorization declined');
                }
            });
        }

    });

});
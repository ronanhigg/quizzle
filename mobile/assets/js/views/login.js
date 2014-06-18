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

            console.log('[AUTH] Attempting to authenticate via Facebook');
            console.log('[AUTH] Callback URL: ' + document.URL);

            App.oauth.redirect('facebook', {
                'cache': true
            }, document.URL);
        },

        _connectToTwitter: function (event) {
            event.preventDefault();

            console.log('[AUTH] Attempting to authenticate via Twitter');
            console.log('[AUTH] Callback URL: ' + document.URL);

            App.oauth.redirect('twitter', {
                'cache': true
            }, document.URL);
        }

    });

});
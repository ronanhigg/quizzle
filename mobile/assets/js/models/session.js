/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'vendor/jquery.cookie',
    'app'
], function ($, _, Backbone, jqueryCookie, App) {

    "use strict";

    return Backbone.Model.extend({

        initialize: function () {
            this.load();
        },

        authenticated: function () {
            return this.get('authToken') !== undefined;
        },

        save: function (sessionData) {
            this.set('authToken', sessionData.authToken);
            $.cookie('authToken', sessionData.authToken);
        },

        load: function () {
            this.set('authToken', $.cookie('authToken'));
            App.gamesparks.setAuthToken($.cookie('authToken'));
        },

        destroy: function () {
            this.set('authToken', undefined);
            $.removeCookie('authToken');
        }

    });
    
});
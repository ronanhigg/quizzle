/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',
], function ($, _, Backbone, Kinvey, App) {

    "use strict";

    return Backbone.View.extend({

        className: 'sync-loader-container js-loader',
        template: App.getTemplate('sync-loader'),

        events: {
        },

        render: function (options) {
            this.$el.html(this.template());
            return this;
        },

    });

});
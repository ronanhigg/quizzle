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

        className: 'loader',
        template: App.getTemplate('loading'),

        events: {
        },

        render: function (options) {
            this.$el.html(this.template());

            if (options.fullScreen) {
                this.$el.addClass('loader--full-screen');
            }

            return this;
        },

    });

});
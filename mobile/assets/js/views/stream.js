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

        className: 'stream',
        template: App.getTemplate('stream'),

        events: {
        },

        initialize: function (options) {
            var _this = this;
        },

        render: function () {
            var _this = this;

            this.$el.html(this.template());

            return this;
        },

    });

});
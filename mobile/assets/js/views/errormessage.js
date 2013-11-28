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

        className: 'error-message',
        template: App.getTemplate('error-message'),

        events: {
        },

        initialize: function (options) {
            var _this = this;
        },

        render: function () {
            var _this = this;

            this.$el.html(this.template({
                message: this.options.message,
                error: this.options.error
            }));

            return this;
        },

    });

});
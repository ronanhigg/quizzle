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

        _templateVars: {},

        events: {
            'click .js-error-details-toggle': '_toggleErrorDetails'
        },

        initialize: function (options) {
            this._templateVars = {
                message: options.message,
                hasDetails: options.details !== undefined
            };

            if (this._templateVars.hasDetails) {
                _.extend(this._templateVars, options.details);
            }

            if (this._templateVars.debug === '') {
                this._templateVars.debug = 'No debug information is available';
            }
        },

        render: function () {
            this.$el.html(this.template(this._templateVars));
            return this;
        },

        _toggleErrorDetails: function () {
            var $errorDetails = this.$el.find('.js-error-details');

            if ($errorDetails.hasClass('hide')) {
                $errorDetails.removeClass('hide');
            } else {
                $errorDetails.addClass('hide');
            }

            return false;
        }

    });

});
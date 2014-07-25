/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app'
], function ($, _, Backbone, Kinvey, App) {

    "use strict";

    return Backbone.View.extend({

        className: 'popup-container',

        initialize: function (options) {
        },

        render: function () {
            this.template = App.getTemplate(this.options.template);

            var $el = this.$el;

            $el.html(this.template(this.options));

            $el.find('.js-popup-dismiss').on('click', function () {
                $el.remove();
                return false;
            });

            return this;
        }

    });

});
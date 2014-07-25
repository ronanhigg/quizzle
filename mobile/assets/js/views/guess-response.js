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

        className: 'guess-response-container',
        template: App.getTemplate('guess-response'),

        initialize: function (options) {
            console.log(options);
        },

        render: function () {
            var $el = this.$el;

            this.options.hasPoints = this.options.points !== undefined;

            $el.html(this.template(this.options));

            $el.find('.js-dismiss-guess-response').on('click', function () {
                $el.remove();
                return false;
            });

            return this;
        }

    });

});
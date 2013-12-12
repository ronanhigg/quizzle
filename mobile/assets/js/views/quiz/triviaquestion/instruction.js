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

        className: 'instruction',
        template: App.getTemplate('quiz-triviaquestion-instruction'),

        render: function () {
            this.$el.html(this.template());
            return this;
        }

    });

});
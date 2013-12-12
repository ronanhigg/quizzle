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

        className: 'js-stream-failure',
        template: App.getTemplate('quiz-failure'),

        render: function () {
            this.$el.html(this.template());
            return this;
        }

    });

});
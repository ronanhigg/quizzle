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

        template: App.getTemplate('quiz-triviamissing'),

        render: function () {
            this.$el.html(this.template());
            return this;
        }

    });

});
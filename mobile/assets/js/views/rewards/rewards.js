/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/quiz/failure'
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    FailureView
) {

    "use strict";

    return Backbone.View.extend({

        className: 'rewards',
        template: App.getTemplate('rewards'),

        events: {
        },

        initialize: function (options) {
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },

    });

});
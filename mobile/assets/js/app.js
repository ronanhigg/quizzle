/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone'
], function($, _, Backbone) {

    "use strict";

    return {
        EventBus: _.extend({}, Backbone.Events),

        getTemplate: function (id) {
            return _.template($.trim($("#" + id + "-template").html()));
        }
    }

});
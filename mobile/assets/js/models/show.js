/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app'
], function (_, Backbone, Kinvey, App) {

    "use strict";

    return Kinvey.Backbone.Model.extend({

        url: 'shows',

        relations: []

    });
    
});
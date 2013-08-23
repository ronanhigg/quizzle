/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'kinvey',
    'app',
    'models/show'
], function (_, Kinvey, App, ShowModel) {

    "use strict";

    return Kinvey.Backbone.Collection.extend({

        url: 'shows',

        model: ShowModel

    });

});
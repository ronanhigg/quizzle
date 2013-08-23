/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'kinvey',
    'app',
    'models/airing'
], function (_, Kinvey, App, AiringModel) {

    "use strict";

    return Kinvey.Backbone.Collection.extend({

        url: 'airings',

        model: AiringModel

    });

});
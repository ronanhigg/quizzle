/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'kinvey',
    'app',
    'models/addetection'
], function (_, Kinvey, App, AdDetectionModel) {

    "use strict";

    return Kinvey.Backbone.Collection.extend({

        url: 'adDetections',

        model: AdDetectionModel

    });

});
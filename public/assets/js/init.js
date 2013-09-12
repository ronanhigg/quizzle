/* Directives for jslint */
/*global requirejs, require */

requirejs.config({
    shim: {
        'vendor/underscore': {
            exports: '_'
        },
        'vendor/bootstrap': [ 'jquery' ]
    },
    paths: {
        jquery: [
            "http://code.jquery.com/jquery",
            "vendor/jquery"
        ],
        'moment': "vendor/moment"
    }
});

require([
    'jquery',
    'vendor/underscore',
    'vendor/bootstrap',
    'moment',
], function ($, _, Bootstrap, moment) {

    "use strict";

});
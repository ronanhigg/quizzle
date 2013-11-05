/* Directives for jslint */
/*global requirejs, require */

requirejs.config({
    shim: {
        'vendor/underscore': {
            exports: '_'
        },
        'vendor/bootstrap': [ 'jquery' ],
        'vendor/bootstrap-datepicker': [ 'jquery' ],
        'vendor/typeahead': [ 'jquery' ]
    },
    paths: {
        jquery: [
            "http://code.jquery.com/jquery",
            "vendor/jquery"
        ],
        'moment': "vendor/moment"
    }
});

requirejs([
    'jquery',
    'vendor/underscore',
    'vendor/bootstrap',
    'moment',

    'views',
    'forms',
    'tables'

], function (
    $,
    _,
    Bootstrap,
    moment,

    Views,
    Forms,
    Tables

) {

    "use strict";

    Views.init();
    Tables.init();
    Forms.init();

});
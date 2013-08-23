/* Directives for jslint */
/*global requirejs, require */


requirejs.config({
    shim: {
        'vendor/underscore': {
            exports: '_'
        },
        'kinvey': [ 'vendor/jquery', 'vendor/underscore' ]
    },
    paths: {
        'jquery': [
            "http://code.jquery.com/jquery",
            "vendor/jquery"
        ],
        'kinvey': [
            '//da189i1jfloii.cloudfront.net/js/kinvey-html5-1.0.4.min',
            'vendor/kinvey'
        ]
    }
});

require([
    'jquery',
    'vendor/underscore',
    'kinvey'
], function ($, _, Kinvey) {

    "use strict";

    /*
    * UI stuff
    *
    * this section is for several UI hacks and global listeners
    */

    // simple trick to hide the URL bar - scroll the page 1px once it loads
    $(function () {
        setTimeout(function () {
            window.scrollTo(0, 1);
        }, 0);
    });

    /*
    * Kinvey init
    *
    * Start the connection with Kinvey, and use our app key and secret to authenticate
    */

    window.KINVEY_DEBUG = true;
    Kinvey.init({
        appKey: "kid_PVgDjNCWFJ",
        appSecret: "a29a208ce80c41a295cc5cd9bfd6ab20"
    })
        .then(function (activeUser) {

            App.user = Kinvey.getActiveUser();
            console.log(App.user);

        });

});
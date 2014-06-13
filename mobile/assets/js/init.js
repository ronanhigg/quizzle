/* Directives for jslint */
/*global requirejs, require */


requirejs.config({
    shim: {
        'vendor/backbone': {
            deps: ['vendor/underscore', 'jquery'],
            exports: 'Backbone'
        },
        'vendor/underscore': {
            exports: '_'
        },
        'vendor/backbone-associations': [ "vendor/backbone" ],
        'kinvey': [ 'vendor/jquery', 'vendor/underscore', 'vendor/backbone' ],
        'vendor/bootstrap': [ 'jquery' ],
        'vendor/async': {
            exports: 'async'
        },
        'gamesparks': {
            exports: 'GameSparks'
        },
        'cryptojs': {
            exports: 'CryptoJS'
        }
    },
    paths: {
        jquery: [
            "http://code.jquery.com/jquery",
            "vendor/jquery"
        ],
        'kinvey': [
            '//da189i1jfloii.cloudfront.net/js/kinvey-backbone-1.0.4.min',
            'vendor/kinvey'
        ],
        'moment': "vendor/moment",
        'gamesparks': "vendor/gamesparks-container",
        'cryptojs': "vendor/hmac-sha256"
    }
});

require([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'vendor/backbone-associations',
    'vendor/bootstrap',
    'moment',
    'kinvey',
    'gamesparks',
    'cryptojs',
    'app',
    'router',
    'models/player',
    'models/session',
    'views/loading'
], function ($, _, Backbone, Associations, Bootstrap, moment, Kinvey, Gamesparks, CryptoJS, App, AppRouter, PlayerModel, SessionModel, LoadingView) {

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

    var loadingView = new LoadingView();

    loadingView.render({
        fullScreen: true
    });

    $('#main').html(loadingView.el);

    GameSparks.prototype.aroundMeLeaderboardRequest = function(leaderboardShortCode, onResponse)
    {
        var request = {};
            request["leaderboardShortCode"] = leaderboardShortCode;
            request["count"] = 1;
            request["social"] = false;
        this.sendWithData("AroundMeLeaderboardRequest", request, onResponse);
    }

    Gamesparks.prototype.logLogoPointsRequest = function(points, onResponse)
    {
        var request = {};
            request["eventKey"] = 'LOGO_GUESS';
            request["POINTS"] = points;
        this.sendWithData("LogEventRequest", request, onResponse);
    };

    Gamesparks.prototype.logTriviaPointsRequest = function(points, onResponse)
    {
        var request = {};
            request["eventKey"] = 'TRIVIA_GUESS';
            request["POINTS"] = points;
        this.sendWithData("LogEventRequest", request, onResponse);
    };

    App.gamesparks = new Gamesparks();

    App.setupPlayer = function (callback) {
        App.gamesparks.sendWithData('AccountDetailsRequest', {}, function (response) {

            var points = 0;

            if (response.scriptData && response.scriptData.points) {
                points = response.scriptData.points;
            }

            App.player = new PlayerModel({
                'id': response.userId,
                //'username': $('#username').val(),
                'name': response.displayName,
                'points': points
            });

            callback();
        });
    }

    window.KINVEY_DEBUG = true;
    Kinvey.init({
        appKey: "kid_PVgDjNCWFJ",
        appSecret: "a29a208ce80c41a295cc5cd9bfd6ab20"
    })
        .then(function (activeUser) {
            // the Kinvey.init function returns a promise which resolves to the active user
            // data (or null if there is no active user). Note: when logged in, activeUser
            // here is *not* an instance of Kinvey.Backbone.User, but just the attributes of
            // the user. You must instantiate the User yourself (to allow for custom subclasses).
            //App.user = App.player = new PlayerModel(activeUser);

            /*
            * Backbone init
            *
            * Create an instance of our router to use for calling `navigate`, and kick everything off by
            * by starting the Backbone history. We hold off on this until the active user state is resolved
            * so we know whether the user is logged in or not.
            */

            App.session = new SessionModel();
            App.session.load();

            App.gamesparks.initPreview({
                key: '180424JtV6cn', 
                onNonce: function (nonce) {
                    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce, '9SGeb0WCbPPogCpLb4EFErWnCJ5TbtVD'));
                },
                onInit: function () {
                    //App.player = new PlayerModel();
                    App.router = new AppRouter();
                    Backbone.history.start();
                },
                onMessage: function (message) {
                    console.log(message);
                },
            });

        });

});
/* Directives for jslint */
/*global requirejs, require */

var cacheBust = 'v4';

(function () {
    var location = location || window.location.href;
    var name = 'env'.replace(/[\[]/,'\\\[').replace(/[\]]/,'\\\]');
    var result = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(location);
    var env = result === null ? undefined : decodeURIComponent(result[1].replace(/\+/g, ' '));

    if (env === 'development') {
        cacheBust = (new Date()).getTime();
    }
})();

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
        },
        'oauth' : {
            exports: 'OAuth'
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
        'cryptojs': "vendor/hmac-sha256",
        'oauth': 'vendor/oauth'
    },
    urlArgs: "bust=" + cacheBust
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
    'oauth',
    'vendor/async',

    'app',
    'router',

    'utilities/auth',

    'collections/addetections',

    'models/player',
    'models/session',

    'views/loading',
    'views/menu/menu',
    'views/modal',

    'factories/player'

], function (
    $,
    _,
    Backbone,
    Associations,
    Bootstrap,
    moment,
    Kinvey,
    Gamesparks,
    CryptoJS,
    OAuth,
    Async,

    App,
    AppRouter,

    AuthUtility,

    AdDetectionsCollection,

    PlayerModel,
    SessionModel,

    LoadingView,
    MenuView,
    ModalView,

    PlayerFactory
) {

    "use strict";

    console.log('[TIME] App running', moment().valueOf());

    // simple trick to hide the URL bar - scroll the page 1px once it loads
    $(function () {
        setTimeout(function () {
            window.scrollTo(0, 1);
        }, 0);
    });

    var loadingView = new LoadingView();
    var menuView = new MenuView();
    var modalView = new ModalView();

    loadingView.render({
        fullScreen: true
    });

    $('#main').html(loadingView.el);
    $('#menu').html(menuView.render().el);
    $('#modal').html(modalView.render().el);

    $('.js-toggle-menu').on('click', function () {
        App.EventBus.trigger('menu:toggle');
        return false;
    });

    App.gamesparks = new Gamesparks();
    App.async = Async;
    App.playerFactory = new PlayerFactory();
    App.auth = new AuthUtility();
    App.oauth = OAuth;

    App.oauth.initialize('MNs8vuhXvYVFuQVxY7AtZdyfRG0');

    //App.oauth.clearCache('facebook');
    //App.oauth.clearCache('twitter');

    App.async.parallel([
        // Kinvey authentication
        function (asyncCallback) {
            window.KINVEY_DEBUG = true;

            console.log('[TIME] (REQ) Kinvey authentication', moment().valueOf());
            Kinvey.init({
                appKey: "kid_PVgDjNCWFJ",
                appSecret: "a29a208ce80c41a295cc5cd9bfd6ab20"
            })
                .then(function (activeUser) {
                    console.log('[TIME] {RES} Kinvey authentication', moment().valueOf());

                    App.adDetections = new AdDetectionsCollection();
                    App.adDetections.fetch();

                    asyncCallback();
                });
        },
        // GameSparks authentication
        function (asyncCallback) {
            App.gamesparks.initPreview({
                key: '180424JtV6cn', 
                onNonce: function (nonce) {
                    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(nonce, '9SGeb0WCbPPogCpLb4EFErWnCJ5TbtVD'));
                },
                onInit: function () {
                    asyncCallback();
                },
                onMessage: function (message) {
                    console.log(message);
                },
            });
        }
    ], function (err, results) {
        //App.player = new PlayerModel();
        App.router = new AppRouter();
        Backbone.history.start();
    });

    /*window.KINVEY_DEBUG = true;
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
            *

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

        });*/

});
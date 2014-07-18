/* Directives for jslint */
/*global define, _ */

define([
    'jquery',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/login',
    'views/rewards/rewards',
    'views/stream/quizstream',

    'collections/addetections',
    'collections/airings',
    'collections/checkins',
    'collections/rewards',

    'models/addetection',
    'models/airing',
    'models/channel',
    'models/checkin',
    'models/player',
    'models/session',
    'models/show'
], function (
    $,
    Backbone,
    Kinvey,
    App,

    LoginView,
    RewardsView,
    QuizStreamView,

    AdDetectionsCollection,
    AiringsCollection,
    CheckInsCollection,
    RewardsCollection,

    AdDetectionModel,
    AiringModel,
    ChannelModel,
    CheckInModel,
    PlayerModel,
    SessionModel,
    ShowModel
) {

    "use strict";

    var ensureLoggedOut = function (originalRoute) {
        return function () {
            var _this = this;
            console.log('[AUTH] Ensure player is logged out');

            App.auth.contextualExec(function () {
                _this.navigate('play', {
                    trigger: true
                });
            }, function () {
                originalRoute.apply(_this, arguments);
            });
        }
    };

    var ensureLogin = function (originalRoute) {
        return function () {
            var _this = this;
            console.log('[AUTH] Ensure player is logged in');

            App.auth.contextualExec(function () {
                originalRoute.apply(_this, arguments);
            }, function () {
                _this.navigate('login', {
                    trigger: true
                });
            });
        };
    };

    return Backbone.Router.extend({

        routes: {
            "": "index",
            "login": "login",
            "logout": "logout",
            "play": "play",
            "rewards": "rewards"
        },

        initialize: function (options) {
            App.auth.setupOAuthCallbacks();
        },

        index: ensureLogin(function () {
            this.navigate('play', {
                trigger: true
            });
        }),

        login: ensureLoggedOut(function () {
            var loginView = new LoginView();
            $('#main').html(loginView.render().el);
        }),

        logout: ensureLogin(function () {
            App.auth.logout();
        }),

        play: ensureLogin(function () {
            var adDetections = new AdDetectionsCollection();

            var quizStreamView = new QuizStreamView({
                collection: adDetections
            });

            $('#main').html(quizStreamView.render().el);

            adDetections.fetch();

            /* DRAGON - Very hacky refresh method, should be changed
             *          if the refresh feature is required.
             *          -- Conor
             */
            /*$('.js-refresh-stream').on('click', function () {
                var adDetectionModel;

                quizStreamView.remove();
                while (adDetectionModel = adDetections.first()) {
                    adDetectionModel.destroy();
                }

                adDetections = new AdDetectionsCollection();
                quizStreamView = new QuizStreamView({
                    collection: adDetections
                });

                $('#main').html(quizStreamView.render().el);
                adDetections.fetch();

                App.EventBus.trigger('menu:hide');

                return false;
            });*/

        }),

        rewards: ensureLogin(function () {

            var rewards = new RewardsCollection();

            var rewardsView = new RewardsView({
                collection: rewards
            });

            rewards.fetch(function () {
                $('#main').html(rewardsView.render().el);
            });
        })

    });

});
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
            var _this = this;
            
            App.auth.setupOAuthCallbacks();

            $('.js-toggle-rewards').on('click', function () {
                var route = 'rewards';
                if (Backbone.history.fragment === 'rewards') {
                    route = 'play';
                }

                _this.navigate(route, {
                    trigger: true
                });

                return false;
            });
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
            App.EventBus.trigger('menu:hide');

            var quizStreamView = new QuizStreamView({
                collection: App.adDetections
            });

            $('#main').html(quizStreamView.render().el);
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
/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/backbone',
    'kinvey',
    'app',
    'loader',

    'views/checkin',
    'views/login',
    'views/register',
    'views/stream',
    'views/streampanel',

    'collections/addetections',
    'collections/airings',
    'collections/checkins',

    'models/airing',
    'models/channel',
    'models/checkin',
    'models/player',
    'models/show'
], function (
    $,
    Backbone,
    Kinvey,
    App,
    Loader,

    CheckInView,
    LoginView,
    RegisterView,
    StreamView,
    StreamPanelView,

    AdDetectionsCollection,
    AiringsCollection,
    CheckInsCollection,

    AiringModel,
    ChannelModel,
    CheckInModel,
    PlayerModel,
    ShowModel
) {

    "use strict";

    var ensureLogin = function (originalRoute) {
        return function () {
            /*if (App.player && App.player.isLoggedIn()) {

                if ($('#player-name').is(':empty')) {
                    $('#player-name').html(App.player.get('name'));
                }

                originalRoute.apply(this, arguments);

            } else {
                if (!(App.main instanceof LoginView)) {
                    App.main = new LoginView({complete: originalRoute});
                    $('#main').html(App.main.render().el);
                }
            }*/
            originalRoute.apply(this, arguments);
        };
    };

    return Backbone.Router.extend({

        routes: {
            "": "index",
            "checkin": "checkIn",
            "stream": "stream",
            "register": "register",
            "logout": "logout"
        },

        index: ensureLogin(function () {
            /*var _this = this;
            App.player.getCurrentCheckIns()
                .then(function (checkIns) {
                    if (checkIns.length > 0) {
                        _this.navigate('stream', {
                            trigger: true
                        });
                    } else {
                        _this.navigate('checkin', {
                            trigger: true
                        });
                    }
                });*/
            this.navigate('stream', {
                trigger: true
            });
        }),

        login: function () {
            var loginView = new LoginView();
            $('#main').html(loginView.render().el);
        },

        logout: ensureLogin(function () {
            var _this = this;
            App.player.logout()
                .then(function () {
                    $('#player-name').empty();
                    _this.navigate('', {
                        trigger: true
                    });
                });
        }),

        register: function () {
            var registerView = new RegisterView();
            $('#main').html(registerView.render().el);
        },

        checkIn: ensureLogin(function () {

            var checkInView,
                airingsQuery,
                checkInsQuery;

            Loader.show('Loading...');

            App.airings = new AiringsCollection();
            App.checkins = new CheckInsCollection();

            airingsQuery = new Kinvey.Query();
            airingsQuery.equalTo('is_currently_on', true);

            checkInsQuery = new Kinvey.Query();
            checkInsQuery.equalTo('is_active', true);
            checkInsQuery.equalTo('player._id', App.player.get('_id'));

            App.airings.fetch({
                query: airingsQuery
            })
                .then(function() {

                    return App.checkins.fetch({
                        query: checkInsQuery
                    });
                })
                .then(function () {

                    Loader.hide();

                    App.initialCheckIns = App.checkins.filter(function () {
                        return true;
                    });

                    checkInView = new CheckInView({
                        airings: App.airings,
                        checkIns: App.checkins
                    });

                    $('#main').html(checkInView.render().el);
                    App.main = checkInView;
                });
        }),

        stream: ensureLogin(function () {
            var lastAdDetectionID,
                panels = [],
                streamView = new StreamView();

            $('#main').html(streamView.render().el);

            Kinvey.execute('fetchAdDetections', {
                'amount': 10
            })
                .then(function (response) {
                    console.log(response);

                    $('#stream-panels').empty();
                    $('.js-stream-load').removeClass('hide');

                    _.each(response.docs, function (doc) {
                        var streamPanelView = new StreamPanelView({
                            panels: panels,
                            doc: doc
                        });
                        lastAdDetectionID = doc._id;
                        $('#stream-panels').append(streamPanelView.render().el);
                    });
                }, function (xhr, status, error) {
                    console.error('PROMISE ERROR 1', xhr, status, error);
                });

            $('.js-stream-load').on('click', function () {
                Kinvey.execute('fetchAdDetections', {
                    'amount': 10,
                    'lastAdDetectionID': lastAdDetectionID
                })
                    .then(function (response) {
                        console.log(response);

                        _.each(response.docs, function (doc) {
                            var streamPanelView = new StreamPanelView({
                                panels: panels,
                                doc: doc
                            });
                            lastAdDetectionID = doc._id;
                            $('#stream-panels').append(streamPanelView.render().el);
                        });
                    }, function (xhr, status, error) {
                        console.error('PROMISE ERROR 1', xhr, status, error);
                    });
                return false;
            });

            $('#main').on('click', '.js-stream-logo-guess', function () {
                var $stream = $(this).parents('.js-stream'),
                    id = $stream.data('id'),
                    guessIndex = $(this).data('index');

                $(this).parents('.js-stream-logos').addClass('hide');

                if (guessIndex === panels[id].correctLogoIndex) {
                    $stream.find('.js-stream-trivia').removeClass('hide');
                } else {
                    $stream.find('.js-stream-failure').removeClass('hide');
                }

                return false;
            });

            $('#main').on('click', '.js-stream-trivia-guess', function () {
                var $stream = $(this).parents('.js-stream'),
                    id = $stream.data('id'),
                    guessIndex = $(this).data('index');

                $(this).parents('.js-stream-trivia').addClass('hide');

                if (guessIndex === panels[id].correctTriviaIndex) {
                    $stream.find('.js-stream-success').removeClass('hide');
                } else {
                    $stream.find('.js-stream-failure').removeClass('hide');
                }

                return false;
            });
        }),

        /* DRAGON - The below function is not used in the application */
        createAnAiring: ensureLogin(function () {

            var channel = new ChannelModel({_id: '5215df838138639764077c25'}),
                show = new ShowModel({_id: '52149b7d2f7b521a2602f656'}),
                airing = new AiringModel();

            channel.fetch()
                .then(function (response, status, xhr) {
                    console.log(response, status, xhr, airing);

                    return show.fetch();
                }, function (xhr, status, error) {
                    console.error('PROMISE ERROR 1', xhr, status, error);
                })
                .then(function (response, status, xhr) {
                    console.log(response, status, xhr, airing);

                    return airing.save({
                        starting_at: "2013-08-29T18:01:00.000Z",
                        finishing_at: "2013-08-29T18:30:00.000Z",
                        is_currently_on: false,
                        channel: channel,
                        show: show
                    });

                }, function (xhr, status, error) {
                    console.error('PROMISE ERROR 2', xhr, status, error);
                })
                .then(function (response, status, xhr) {
                    console.log(3, response, status, xhr);
                    console.log(4, airing);
                }, function (xhr, status, error) {
                    console.error('PROMISE ERROR 3', xhr, status, error);
                });
        }),

        /* DRAGON - The below function is not used in the application */
        createACheckIn: ensureLogin(function () {

            var airing = new AiringModel({_id: '52149c6881386397640427bf'}),
                checkin = new CheckInModel();

            airing.fetch()
                .then(function (response, status, xhr) {
                    console.log(response, status, xhr);

                    return checkin.save({
                        is_active: true,
                        is_manual: true,
                        airing: airing,
                        player: App.player
                    });
                }, function (xhr, status, error) {
                    console.error('PROMISE ERROR 1', xhr, status, error);
                })
                .then(function (response, status, xhr) {
                    console.log(response, status, xhr);
                    console.log(checkin);
                }, function (xhr, status, error) {
                    console.error('PROMISE ERROR 2', xhr, status, error);
                });

        })

    });

});
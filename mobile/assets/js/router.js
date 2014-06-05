/* Directives for jslint */
/*global define, _ */

define([
    'jquery',
    'vendor/backbone',
    'kinvey',
    'app',
    //'loader',

    //'views/checkin',
    //'views/errormessage',
    //'views/login',
    //'views/register',
    'views/menu/menu',
    'views/stream/quizstream',
    //'views/streampanel',

    'collections/addetections',
    'collections/airings',
    'collections/checkins',

    'models/addetection',
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
    //Loader,

    //CheckInView,
    //ErrorMessageView,
    //LoginView,
    //RegisterView,
    MenuView,
    QuizStreamView,
    //StreamPanelView,

    AdDetectionsCollection,
    AiringsCollection,
    CheckInsCollection,

    AdDetectionModel,
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
            "play": "play"
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
            this.navigate('play', {
                trigger: true
            });
        }),

        /*login: function () {
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
        }),*/

        play: ensureLogin(function () {
            var adDetections = new AdDetectionsCollection(),

                menuView = new MenuView(),

                quizStreamView = new QuizStreamView({
                    collection: adDetections
                });

            $('.js-show-menu').on('click', function () {
                App.EventBus.trigger('menu:show');
                return false;
            });

            $('#menu').html(menuView.render().el);
            $('#main').html(quizStreamView.render().el);

            adDetections.fetch();

            /* DRAGON - Very hacky refresh method, should be changed
             *          if the refresh feature is required.
             *          -- Conor
             */
            $('.js-refresh-stream').on('click', function () {
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
            });

            return;




            /*var lastAdDetectionID,

                addWorthlessPoints,
                fetchInitialAdDetections,
                fetchMoreAdDetections,
                handleNoDocs,
                generateStreamPanelViewForEachDoc,

                AMOUNT = 10,

                panelDisplayID = 1,
                retries = 0,
                worthlessPoints = 0,
                panels = [],
                streamView = new StreamView();

            addWorthlessPoints = function (extraWorthlessPoints) {
                worthlessPoints += extraWorthlessPoints;
                $('.js-points').html(worthlessPoints);
            };

            handleNoDocs = function (response) {
                if (response.isIncomplete && retries < 3) {
                    retries++;
                    fetchMoreAdDetections();
                } else {
                    $('.js-loading').addClass('hide');
                    $('.js-stream-depleted').removeClass('hide');
                }
            };

            generateStreamPanelViewForEachDoc = function (response, callbackForEach) {
                _.each(response.docs, function (doc) {
                    var streamPanelView = new StreamPanelView({
                            panels: panels,
                            doc: doc,
                            displayID: panelDisplayID
                        });

                    panelDisplayID++;
                    lastAdDetectionID = doc._id;

                    $('#stream-panels').append(streamPanelView.render().el);

                    if (callbackForEach !== undefined) {
                        callbackForEach();
                    }
                });
            };

            fetchInitialAdDetections = function () {
                Kinvey.execute('fetchAdDetections', {
                    'amount': AMOUNT,
                    'includeAdlessDetections': $('.js-fetch-adless').is(':checked'),
                    'includeTrivialessDetections': $('.js-fetch-trivialess').is(':checked')
                })
                    .then(function (response) {
                        if (response.docs.length === 0) {
                            handleNoDocs(response);
                            return;
                        }

                        $('.js-stream-try-again').addClass('hide');
                        $('.js-loading').addClass('hide');
                        $('.js-stream-load').removeClass('hide');

                        generateStreamPanelViewForEachDoc(response);

                    }, function (xhr, status, error) {
                        $('.js-loading').addClass('hide');
                        $('.js-stream-try-again').removeClass('hide');

                        var errorMessageView = new ErrorMessageView({
                            message: 'There was a connection problem and the ad stream was not retrieved',
                            error: xhr
                        });
                        $('#stream-panels').html(errorMessageView.render().el);
                    });
            };

            fetchMoreAdDetections = function () {
                Kinvey.execute('fetchAdDetections', {
                    'amount': AMOUNT,
                    'lastAdDetectionID': lastAdDetectionID,
                    'includeAdlessDetections': $('.js-fetch-adless').is(':checked'),
                    'includeTrivialessDetections': $('.js-fetch-trivialess').is(':checked')
                })
                    .then(function (response) {
                        var panelsRendered = 0;

                        if (response.docs.length === 0) {
                            handleNoDocs(response);
                            return;
                        }

                        $('.js-loading').addClass('hide');
                        $('.js-stream-load').removeClass('hide');

                        generateStreamPanelViewForEachDoc(response, function () {
                            var $lastPanel;

                            panelsRendered++;

                            if (panelsRendered === 1) {
                                $lastPanel = $('#stream-panels').children().filter(':last');

                                $('html, body').animate({
                                    scrollTop: $lastPanel.offset().top - 70
                                }, 400);
                            }
                        });

                    }, function (xhr, status, error) {
                        $('.js-loading').addClass('hide');
                        $('.js-stream-load').removeClass('hide');

                        var errorMessageView = new ErrorMessageView({
                            message: 'There was a connection problem and further ads for the stream were not retrieved',
                            error: xhr
                        });
                        $('#stream-panels').append(errorMessageView.render().el);
                    });
            };

            $('#main').html(streamView.render().el);

            fetchInitialAdDetections();

            $('.js-stream-try-again').on('click', function () {
                $('.js-loading').removeClass('hide');
                $('.error-message').remove();

                fetchInitialAdDetections();
                return false;
            });

            $('.js-stream-load').on('click', function () {
                $(this).addClass('hide');
                $('.js-loading').removeClass('hide');
                $('.error-message').remove();

                fetchMoreAdDetections();
                return false;
            });

            $('#main').on('swiperight', '.quiz', function () {
                console.log('Swipe Right');
            });

            $('#main').on('swipeleft', '.quiz', function () {
                console.log('Swipe Left');
            });

            $('#main').on('click', '.js-stream-logo-guess', function () {
                var $stream = $(this).parents('.js-stream'),
                    id = $stream.data('id'),
                    guessIndex = $(this).data('index');

                $(this).parents('.js-stream-logos').addClass('hide');

                if (guessIndex === panels[id].correctLogoIndex) {
                    if ($stream.find('.js-stream-trivia-missing').length > 0) {
                        addWorthlessPoints(100);
                    }
                    $stream.find('.js-quiz-q2').removeClass('hide');
                } else {
                    $stream.find('.js-stream-failure').removeClass('hide');
                }

                return false;
            });

            $('#main').on('click', '.js-stream-trivia-guess', function () {
                var $stream = $(this).parents('.js-stream'),
                    id = $stream.data('id'),
                    guessIndex = $(this).data('index');

                $(this).parents('.js-quiz-q2')
                    .find('.js-quiz-q2-instruction, .js-quiz-q2-answer')
                    .addClass('hide');

                if (guessIndex === panels[id].correctTriviaIndex) {
                    addWorthlessPoints(500);
                    $stream.find('.js-stream-success').removeClass('hide');
                    $stream.find('.js-quiz-q2-trivia-answer').removeClass('hide');
                } else {
                    addWorthlessPoints(100);
                    $stream.find('.js-stream-failure').removeClass('hide');
                }

                return false;
            });

            $('#main').on('click', '.js-toggle-display', function () {
                var target = $(this).data('toggle-display-target'),
                    $target = $('[data-toggle-display-name="' + target + '"]');

                if ($target.hasClass('hide')) {
                    $target.removeClass('hide');
                } else {
                    $target.addClass('hide');
                }

                return false;
            });*/
        })

        /*

        * DRAGON - The below function is not used in the application *
        createAnAiring: ensureLogin(function () {

            var channel = new ChannelModel({_id: '5215df838138639764077c25'}),
                show = new ShowModel({_id: '52149b7d2f7b521a2602f656'}),
                airing = new AiringModel();

            channel.fetch()
                .then(function (response, status, xhr) {
                    //console.log(response, status, xhr, airing);

                    return show.fetch();
                }, function (xhr, status, error) {
                    //console.error('PROMISE ERROR 1', xhr, status, error);
                })
                .then(function (response, status, xhr) {
                    //console.log(response, status, xhr, airing);

                    return airing.save({
                        starting_at: "2013-08-29T18:01:00.000Z",
                        finishing_at: "2013-08-29T18:30:00.000Z",
                        is_currently_on: false,
                        channel: channel,
                        show: show
                    });

                }, function (xhr, status, error) {
                    //console.error('PROMISE ERROR 2', xhr, status, error);
                })
                .then(function (response, status, xhr) {
                    //console.log(3, response, status, xhr);
                    //console.log(4, airing);
                }, function (xhr, status, error) {
                    //console.error('PROMISE ERROR 3', xhr, status, error);
                });
        }),

        * DRAGON - The below function is not used in the application *
        createACheckIn: ensureLogin(function () {

            var airing = new AiringModel({_id: '52149c6881386397640427bf'}),
                checkin = new CheckInModel();

            airing.fetch()
                .then(function (response, status, xhr) {
                    //console.log(response, status, xhr);

                    return checkin.save({
                        is_active: true,
                        is_manual: true,
                        airing: airing,
                        player: App.player
                    });
                }, function (xhr, status, error) {
                    //console.error('PROMISE ERROR 1', xhr, status, error);
                })
                .then(function (response, status, xhr) {
                    //console.log(response, status, xhr);
                    //console.log(checkin);
                }, function (xhr, status, error) {
                    //console.error('PROMISE ERROR 2', xhr, status, error);
                });

        })

        */

    });

});
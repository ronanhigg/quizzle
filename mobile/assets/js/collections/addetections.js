/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',
    'vendor/async',
    'models/addetection'
], function ($, _, Backbone, Kinvey, App, Async, AdDetectionModel) {

    "use strict";

    var AMOUNT_TO_FETCH = 10;

    return Backbone.Collection.extend({

        model: AdDetectionModel,

        _lastAdDetectionID: undefined,
        _lastAdDetectionCreatedAt: undefined,

        _logos: [],

        initialize: function () {
            var self = this;

            var query = new Kinvey.Query();

            query.limit(200);

            console.log('[TIME] (REQ) Fetch advertisers', moment().valueOf());
            Kinvey.DataStore.find('advertisers', query)
                .then(function (response) {
                    console.log('[TIME] {RES} Fetch advertisers', moment().valueOf());
                    _.each(response, function (advertiser) {
                        self._logos.push(advertiser.logo_url);
                    });
                });
        },

        fetch: function () {
            var self = this;

            var query = new Kinvey.Query();

            query.equalTo('has_ad_data', ! $('.js-fetch-adless').is(':checked'));
            query.equalTo('has_quiz_data', ! $('.js-fetch-trivialess').is(':checked'));

            if (this._lastAdDetectionCreatedAt !== undefined) {
                query.lessThan('_kmd.ect', this._lastAdDetectionCreatedAt);
            }

            query.limit(AMOUNT_TO_FETCH);
            query.descending('broadcast_starting_at');

            console.log('[TIME] (REQ) Fetch ad detections', moment().valueOf());
            Kinvey.DataStore.find('adDetections', query, {
                relations: {
                    'ad': 'ads',
                    'ad.advertiser': 'advertisers',
                    'channel': 'channels'
                }
            })
                .then(function (response) {
                    console.log('[TIME] {RES} Fetch ad detections', moment().valueOf());

                    self.trigger('fetch:succeeded');

                    if (response.length === 0) {
                        self.trigger('fetch:nomodels');
                        return;
                    }

                    var newModels = [];

                    _.each(response, function (adDetection) {

                        if (adDetection.ad !== undefined) {

                            adDetection.adTitle = adDetection.ad.title;
                            adDetection.storyboardURL = adDetection.ad.storyboard_url;

                            if (adDetection.ad.advertiser !== undefined) {
                                adDetection.advertiserID = adDetection.ad.advertiser._id;
                                adDetection.advertiserLogo = adDetection.ad.advertiser.logo_url;
                                adDetection.advertiserName = adDetection.ad.advertiser.name;
                            }
                        }

                        if (adDetection.channel !== undefined) {
                            adDetection.channelName = adDetection.channel.name;
                        }

                        adDetection.otherLogos = _.sample(self._logos, 3);
                        adDetection.question = {};

                        var adDetectionModel = new AdDetectionModel(adDetection);

                        newModels.push(adDetectionModel);
                        self._lastAdDetectionCreatedAt = adDetection._kmd.ect;
                    });

                    self.add(newModels);
                    console.log('[TIME] Ad detection models added', moment().valueOf());

                    Async.each(newModels, function (adDetectionModel, asyncCallback) {
                        if ( ! adDetectionModel.get('has_quiz_data')) {
                            return asyncCallback();
                        }

                        Kinvey.execute('fetchRandomAdvertiserQuiz', {'id': adDetectionModel.get('advertiserID')})
                            .then(function (response) {
                                adDetectionModel.set('question', response);
                                return asyncCallback();
                            }, function (xhr, status, error) {
                                adDetectionModel.set('has_quiz_data', false);
                                return asyncCallback();
                            });

                    }, function (err) {
                        //self.add(newModels);
                        //console.log('[TIME] Ad detection model ' + adDetection._id + ' added', moment().valueOf());
                        self.trigger('fetch:updated');
                    });

                }, function (xhr, status, error) {
                    self.trigger('fetch:failed', xhr);
                });
        },

        /*wackyFetch: function () {
            var self = this;

            var query = new Kinvey.Query();

            query.equalTo('has_ad_data', ! $('.js-fetch-adless').is(':checked'));
            query.equalTo('has_quiz_data', ! $('.js-fetch-trivialess').is(':checked'));

            if (this._lastAdDetectionCreatedAt !== undefined) {
                query.lessThan('_kmd.ect', this._lastAdDetectionCreatedAt);
            }

            query.limit(AMOUNT_TO_FETCH);
            query.descending('broadcast_starting_at');

            Kinvey.DataStore.find('adDetections', query)
                .then(function (response) {

                    if (response.length === 0) {
                        self.trigger('fetch:succeeded');
                        self.trigger('fetch:nomodels');
                        return;
                    }

                    //var unorderedModels = [];

                    Async.each(response, function (adDetection, asyncCallback) {

                        Kinvey.execute('fetchAdGameData', {'id': adDetection._id})
                            .then(function (response) {

                                self.add(new AdDetectionModel(response));
                                self._lastAdDetectionCreatedAt = response._kmd.ect;
                                //unorderedModels.push(new AdDetectionModel(response));

                                asyncCallback();

                            }, function (xhr, status, error) {
                                asyncCallback('Fetch failed', xhr);
                            });

                    }, function (err, xhr) {
                        if (err) {
                            self.trigger('fetch:failed', xhr);
                        } else {

                            /*console.log('finished...');

                            console.log(unorderedModels);

                            var orderedModels = _.sortBy(unorderedModels, function (adDetectionModel) {
                                return adDetectionModel._kmd.ect;
                            });

                            console.log(orderedModels);

                            self.add(orderedModels);
                            self._lastAdDetectionCreatedAt = self.last()._kmd.ect;

                            console.log(self._lastAdDetectionCreatedAt);*

                            self.trigger('fetch:succeeded');
                            self.trigger('fetch:updated');
                        }
                    });

                }, function (xhr, status, error) {
                    self.trigger('fetch:failed', xhr);
                });

        },*/

        customFetch: function () {
            var self = this,

            conditions = {
                'amount': AMOUNT_TO_FETCH,
                'includeAdlessDetections': $('.js-fetch-adless').is(':checked'),
                'includeTrivialessDetections': $('.js-fetch-trivialess').is(':checked')
            };

            this.trigger('fetch:request');

            if (this._lastAdDetectionID !== undefined) {
                conditions.lastAdDetectionID = this._lastAdDetectionID;
            }

            Kinvey.execute('fetchAdDetections', conditions)
                .then(function (response) {

                    self.trigger('fetch:succeeded');

                    if (response.docs.length === 0) {
                        self.trigger('fetch:nomodels');
                        return;
                    }

                    _.each(response.docs, function (doc) {
                        self.add(new AdDetectionModel(doc));
                        self._lastAdDetectionID = doc._id;
                    });

                    self.trigger('fetch:updated');
                }, function (xhr, status, error) {
                    self.trigger('fetch:failed', xhr);
                });
        }

    });

});
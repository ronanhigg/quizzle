/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',
    'models/addetection'
], function ($, _, Backbone, Kinvey, App, AdDetectionModel) {

    "use strict";

    var AMOUNT_TO_FETCH = 10;

    return Backbone.Collection.extend({

        model: AdDetectionModel,

        _lastAdDetectionID: undefined,

        fetch: function () {
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
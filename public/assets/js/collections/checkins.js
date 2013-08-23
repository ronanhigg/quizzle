/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'kinvey',
    'app',
    'models/checkin'
], function (_, Kinvey, App, CheckInModel) {

    "use strict";

    var CheckInsCollection = Kinvey.Backbone.Collection.extend({

        url: 'checkins',

        model: CheckInModel,

        byAiring: function (airing) {
            var filtered = this.filter(function (checkin) {
                return checkin.get('airing._id') === airing.get('_id');
            });
            return new CheckInsCollection(filtered);
        }

    });

    return CheckInsCollection;

});
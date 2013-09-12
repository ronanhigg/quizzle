/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app'
], function (_, Backbone, Kinvey, App) {

    "use strict";

    return Kinvey.Backbone.User.extend({

        getCurrentCheckIns: function () {

            var query, checkIns;

            query = new Kinvey.Query();
            query.equalTo('is_active', true);
            query.equalTo('player._id', this.get('_id'));

            checkIns = new Kinvey.Backbone.Collection([], {
                url: 'checkins'
            });

            return checkIns.fetch({
                query: query
            });
        }

    });

});
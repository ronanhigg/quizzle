/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',
    'models/airing',
], function (_, Backbone, Kinvey, App, AiringModel) {

    "use strict";

    return Kinvey.Backbone.Model.extend({

        relations: [{
            type: Backbone.One,
            key: 'airing',
            relatedModel: AiringModel,
            autoFetch: true,
            autoSave: false
        },
        {
            type: Backbone.One,
            key: 'player',
            relatedModel: Kinvey.Backbone.User,
            autoFetch: true
        }],

        url: 'checkins'

    });
    
});
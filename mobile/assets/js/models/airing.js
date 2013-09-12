/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',
    'models/channel',
    'models/show'
], function (_, Backbone, Kinvey, App, ChannelModel, ShowModel) {

    "use strict";

    return Kinvey.Backbone.Model.extend({

        relations: [{
            type: Backbone.One,
            key: 'channel',
            relatedModel: ChannelModel,
            autoFetch: true,
            autoSave: true
        },
        {
            type: Backbone.One,
            key: 'show',
            relatedModel: ShowModel,
            autoFetch: true,
            autoSave: true
        }],

        url: 'airings'

    });
    
});
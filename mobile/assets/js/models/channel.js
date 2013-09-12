/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app'
], function (_, Backbone, Kinvey, App) {

    "use strict";

    return Kinvey.Backbone.Model.extend({

        url: 'channels',

        relations: [/*{
            type: Backbone.Many,
            key: 'airings',
            relatedModel: AiringModel,
            autoFetch: true,
            autoSave: true
        }*/]

    });

    /*var Channel = new Backbone.Model.extend({
        urlRoot: 'channels'
    });

    _.extend(Channel.prototype, Kinvey.Backbone.ModelMixin);

    return Channel;*/
    
});
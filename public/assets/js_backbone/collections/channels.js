/* Directives for jslint */
/*global define */

define([
    'vendor/underscore',
    'kinvey',
    'app',
    'models/channel'
], function (_, Kinvey, App, ChannelModel) {

    "use strict";

    return Kinvey.Backbone.Collection.extend({

        url: 'channels',

        model: ChannelModel

    });

    /*var Channels = Backbone.Collection.extend({
        url: 'channels',
        model: ChannelModel
    });

    _.extend(Channels.prototype, Kinvey.Backbone.CollectionMixin);

    return Channels;*/
});
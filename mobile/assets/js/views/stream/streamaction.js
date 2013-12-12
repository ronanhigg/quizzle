/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',
], function ($, _, Backbone, Kinvey, App) {

    "use strict";

    return Backbone.View.extend({

        _label: undefined,
        _action: undefined,

        tagName: 'a',

        events: {
            'click': '_invokeAction'
        },

        initialize: function (options) {
            this._label = options.label;
            this._action = options.action;
        },

        attributes: function () {
            var classes = 'action';

            return {
                'class':  classes,
                'href': '#'
            };
        },

        render: function () {
            this.$el.html(this._label);
            return this;
        },

        _invokeAction: function () {
            if (this._action == 'load-more') {
                this._loadMore();
            } else if (this._action == 'try-again') {
                this._tryAgain();
            }
            return false;
        },

        _loadMore: function () {
            this.remove();
            this.collection.fetch();
        },

        _tryAgain: function () {
            this.remove();
            this.collection.fetch();
        }

    });

});
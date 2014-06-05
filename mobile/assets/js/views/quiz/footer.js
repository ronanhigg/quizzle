/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',
    'moment'
], function ($, _, Backbone, Kinvey, App, moment) {

    "use strict";

    return Backbone.View.extend({

        className: 'quiz-footer js-quiz-footer',
        template: App.getTemplate('quiz-footer'),

        events: {
        },

        initialize: function (options) {
            var startingAt = this.model.get('broadcast_starting_at');
            startingAt = moment(startingAt.toString(), "YYYYMMDDTHHmmssZ");
            startingAt = startingAt.fromNow();

            this._templateVars = {
                'id': options.index + 1,
                'channelName': this.model.get('channelName'),
                'startingAt': startingAt
            };
        },

        render: function () {
            this.$el.html(this.template(this._templateVars));
            return this;
        }

    });

});
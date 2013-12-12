/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app'
], function ($, _, Backbone, Kinvey, App) {

    "use strict";

    return Backbone.View.extend({

        template: App.getTemplate('quiz-screenshot'),

        positions: [
            '661px -7px',
            '330px -7px',
            '-7px -7px',
            '661px -198px',
            '330px -198px',
            '-7px -198px',
            '661px -338px',
            '330px -338px'
            //'-7px -338px', - Remove this frame
        ],

        events: {
        },

        initialize: function () {
            this._templateVars = {
                imgURL: this.model.get('storyboardURL'),
                backgroundPosition: this.positions[_.random(0, 8)]
            };
        },

        render: function () {
            this.$el.html(this.template(this._templateVars));
            return this;
        }

    });

});
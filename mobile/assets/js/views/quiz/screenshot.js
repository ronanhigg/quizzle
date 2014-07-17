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

        className: 'screenshot-container',
        //template: App.getTemplate('quiz-screenshot'),

        positions: {
            'small': [
                '661px -7px',
                '330px -7px',
                '-7px -7px',
                '661px -198px',
                '330px -198px',
                '-7px -198px',
                '661px -389px',
                //'330px -389px', // - Remove this frame
                '-7px -389px'
            ],
            'large': [
                '-3px -3px',
                '-326px -3px',
                '-649px -3px',
                '-3px -202px',
                '-326px -202px',
                '-649px -202px',
                '-3px -401px',
                '-326px -401px',
                //'-649px -401px' // - Remove this frame
            ]
        },

        events: {
        },

        initialize: function () {

            var _this = this;

            this._templateVars = {
                imgURL: this.model.get('storyboardURL'),
                backgroundPosition: this.positions[_.random(0, 7)]
            };
        },

        render: function () {
            var _this = this;

            var storyboardImage = new Image;
            storyboardImage.onload = function () {
                var screenshotSize;

                if (this.width === 972) {
                    screenshotSize = 'large';

                } else if (this.width === 492) {
                    screenshotSize = 'small';

                } else {
                    return console.error('Invalid image width [' + this.width + ']');
                }

                _this.template = App.getTemplate('quiz-screenshot-' + screenshotSize);
                _this._templateVars.backgroundPosition = _this.positions[screenshotSize][_.random(0, _this.positions[screenshotSize].length - 1)];

                _this.$el.html(_this.template(_this._templateVars));
            };

            storyboardImage.src = this.model.get('storyboardURL');

            return this;
        }

    });

});
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

    var isElementPartiallyInViewport = function ($el) {

        var rect = $el[0].getBoundingClientRect();

        return (
            rect.top + rect.height >= 0 &&
            rect.left + rect.width >= 0 &&
            rect.bottom - rect.height <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right - rect.width <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

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

                var index = _.random(0, _this.positions[screenshotSize].length - 1);

                _this.template = App.getTemplate('quiz-screenshot-' + screenshotSize);
                _this._templateVars.backgroundPosition = _this.positions[screenshotSize][index];

                _this.$el.html(_this.template(_this._templateVars));

                var $screenshot = _this.$el.find('.js-screenshot');

                setInterval(function () {
                    index++;

                    if (index >= _this.positions[screenshotSize].length) {
                        index = 0;
                    }

                    if (isElementPartiallyInViewport($screenshot)) {
                        var $nextScreenshot = $screenshot.clone();
                        $nextScreenshot.css('background-position', _this.positions[screenshotSize][index]);

                        $screenshot.appendTo($nextScreenshot);
                        $nextScreenshot.appendTo(_this.$el);

                        $screenshot.fadeOut('slow', function () {
                            $(this).remove();
                        });

                        $screenshot = $nextScreenshot;
                    }

                }, 1500);
            };

            storyboardImage.src = this.model.get('storyboardURL');

            return this;
        }

    });

});
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
                '571px -7px',
                '285px -7px',
                '-7px -7px',
                '571px -173px',
                '285px -173px',
                '-7px -173px',
                '571px -339px',
                //'285px -339px', // - Remove this frame
                '-7px -339px'
            ],
            'large': [
                '-3px -3px',
                '-284px -3px',
                '-565px -3px',
                '-3px -176px',
                '-284px -176px',
                '-565px -176px',
                '-3px -349px',
                '-284px -349px',
                //'-565px -349px' // - Remove this frame
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

            this.listenTo(App.EventBus, 'ticker:slideshow', this._renderNext);
        },

        render: function () {
            var _this = this;

            var storyboardImage = new Image;
            storyboardImage.onload = function () {
                var screenshotSize = _this._getScreenshotSize(this.width);

                _this._width = this.width;
                _this._index = _.random(0, _this.positions[screenshotSize].length - 1);

                _this.template = App.getTemplate('quiz-screenshot-' + screenshotSize);
                _this._templateVars.backgroundPosition = _this.positions[screenshotSize][_this._index];

                _this.$el.html(_this.template(_this._templateVars));
            };

            storyboardImage.src = this.model.get('storyboardURL');

            return this;
        },

        _renderNext: function () {
            var $screenshot = this.$el.find('.js-screenshot');
            var screenshotSize = this._getScreenshotSize(this._width);

            this._index++;

            if (this._index >= this.positions[screenshotSize].length) {
                this._index = 0;
            }

            if (this._isElementPartiallyInViewport($screenshot)) {
                var $nextScreenshot = $screenshot.clone();
                $nextScreenshot.css('background-position', this.positions[screenshotSize][this._index]);

                $screenshot.appendTo($nextScreenshot);
                $nextScreenshot.appendTo(this.$el);

                $screenshot.fadeOut('slow', function () {
                    $(this).remove();
                });

                $screenshot = $nextScreenshot;
            }
        },

        _getScreenshotSize: function (width) {
            if (width === 972) {
                return 'large';
            }

            if (width === 492) {
                return 'small';
            }

            console.error('Invalid image width [' + width + ']');
        },

        _isElementPartiallyInViewport: function ($el) {

            var rect = $el[0].getBoundingClientRect();

            return (
                rect.top + rect.height >= 0 &&
                rect.left + rect.width >= 0 &&
                rect.bottom - rect.height <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right - rect.width <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

    });

});
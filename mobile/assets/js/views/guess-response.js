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

        className: 'guess-response-container',
        template: App.getTemplate('guess-response'),

        initialize: function (options) {
            this.options.hasPoints = this.options.points !== undefined;

            if (this.options.actionType === 'next') {
                this.options.actionHook = 'js-guess-response-next';
            } else if (this.options.actionType === 'continue') {
                this.options.actionHook = 'js-guess-response-dismiss';
            } else {
                console.error("A valid action type is missing");
                return this;
            }
        },

        render: function () {
            var _this = this;
            var $el = this.$el;

            $el.html(this.template(this.options));

            $el.find('.js-guess-response-dismiss').on('click', function () {
                $el.remove();
                return false;
            });

            $el.find('.js-guess-response-next').on('click', function () {
                $el.remove();
                App.EventBus.trigger('stream:next', _this.options.quizId);
                return false;
            });

            return this;
        }

    });

});
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

        className: 'modal-message',
        template: App.getTemplate('modal'),

        initialize: function (options) {
            this.listenTo(App.EventBus, 'message', this._showMessage);
        },

        render: function () {
            this.$el.html(this.template({
                message: this.message
            }));
            return this;
        },

        _showMessage: function (message) {
            var _this = this;

            this.$el.html(message);
            this.$el.css('display', 'block')
            this.$el.animate({
                'opacity': 1
            }, 200);

            setTimeout(function () {
                _this.$el.animate({
                    'opacity': 0
                }, 400, function () {
                    _this.$el.css('display', 'none');
                });
            }, 2000);
        }

    });

});
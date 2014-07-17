/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/quiz/failure'
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    FailureView
) {

    "use strict";

    return Backbone.View.extend({

        className: 'menu',
        template: App.getTemplate('menu'),

        events: {
            'click .js-hide-menu': '_hide',
            'click .js-menu-nav': '_hideAndContinue',
            'click .js-connect-facebook': '_connectToFacebook',
            'click .js-connect-twitter': '_connectToTwitter'
        },

        initialize: function (options) {
            this.isMenuShown = false;
            this.isPlayerLoaded = false;

            this.listenTo(App.EventBus, 'player:loaded', this._renderPlayerDetails);
            this.listenTo(App.EventBus, 'player:unloaded', this._unrenderPlayerDetails);
            this.listenTo(App.EventBus, 'menu:show', this._show);
            this.listenTo(App.EventBus, 'menu:hide', this._hide);
            this.listenTo(App.EventBus, 'menu:toggle', this._toggle);
            this.listenTo(App.EventBus, 'points:change', this._renderPoints);
            this.listenTo(App.EventBus, 'cash:change', this._renderCash);
        },

        render: function () {
            if (App.player) {
                this._renderPlayerDetails();
            }
            return this;
        },

        _show: function (event) {
            if (this.isPlayerLoaded) {
                this.isMenuShown = true;
                $('.menu').animate({
                    'left': 0,
                    'right': '50%'
                }, 500);
            }

            return false;
        },

        _hide: function (event) {
            if (this.isPlayerLoaded) {
                this.isMenuShown = false;
                $('.menu').animate({
                    'left': '-50%',
                    'right': '100%'
                }, 500);
            }

            return false;
        },

        _hideAndContinue: function (event) {
            if (this.isPlayerLoaded) {
                this.isMenuShown = false;
                $('.menu').animate({
                    'left': '-50%',
                    'right': '100%'
                }, 500);
            }
        },

        _toggle: function (event) {
            if (this.isMenuShown) {
                return this._hide();
            } else {
                return this._show();
            }
        },

        _renderPoints: function (points) {
            this.$el.find('.js-points').html(points);
        },

        _renderCash: function (cash) {
            this.$el.find('.js-cash').html(cash);
        },

        _renderPlayerDetails: function () {
            this.isPlayerLoaded = true;
            this.$el.html(this.template({
                name: App.player.get('name'),
                points: App.player.get('points'),
                photo: App.player.get('photo'),
                cash: App.player.get('cash')
            }));
        },

        _unrenderPlayerDetails: function () {
            this.isPlayerLoaded = false;
            this.$el.html('');
        },

        _connectToFacebook: function (event) {
            event.preventDefault();
            App.player.connectToFacebook();
        },

        _connectToTwitter: function (event) {
            event.preventDefault();
            App.EventBus.trigger('message', 'Twitter social connection is not yet implemented');
        }

    });

});
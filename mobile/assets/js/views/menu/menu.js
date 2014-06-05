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
            'click .js-hide-menu': '_hide'
        },

        initialize: function (options) {
            this.listenTo(App.EventBus, 'menu:show', this._show);
            this.listenTo(App.EventBus, 'menu:hide', this._hide);
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },

        _show: function (event) {
            $('.menu').animate({
                'left': 0,
                'right': 0
            }, 500);

            return false;
        },

        _hide: function (event) {
            $('.menu').animate({
                'left': '-100%',
                'right': '100%'
            }, 500);

            return false;
        }

        /*initialize: function (options) {
            this.children = [];

            if (!this.model.get('noAdData')) {
                this.children.push(new ScreenshotView({
                    model: this.model
                }));

                this.children.push(new LogoQuestionView({
                    model: this.model
                }));
            }

            this.children.push(new FooterView({
                model: this.model,
                index: options.index
            }));

            this.listenTo(this.model, 'guess:correctlogo', this._renderTriviaQuestion);
            this.listenTo(this.model, 'guess:correcttrivia', this._renderPoints);
            this.listenTo(this.model, 'guess:incorrect', this._renderFailureMessage);
        },*/

        /*render: function () {
            var self = this;

            this.$el.attr('data-id', this.model.get('_id'));

            _.each(this.children, function (child) {
                self.$el.append(child.render().el);
            });

            return this;
        },*/

    });

});
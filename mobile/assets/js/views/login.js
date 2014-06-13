/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'models/player',
    'models/session'
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    PlayerModel,
    SessionModel
) {

    "use strict";

    return Backbone.View.extend({

        className: 'login',
        template: App.getTemplate('login'),

        events: {
            'submit .js-login-form': '_login'
        },

        initialize: function (options) {
        },

        render: function () {
            this.$el.html(this.template({
            }));
            return this;
        },

        _login: function () {

            App.gamesparks.authenticationRequest($('#password').val(), $('#username').val(), function (response) {

                if (response.error) {
                    App.EventBus.trigger('message', 'Invalid login credentials');
                    return;
                }

                App.session.save({
                    'authToken': App.gamesparks.getAuthToken(),
                });

                App.playerFactory.build(function () {
                    App.router.navigate('play', {
                        trigger: true
                    });
                });

            });

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
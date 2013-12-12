/* Directives for jslint */
/*global define */

define([
    'vendor/backbone',
    'kinvey',
    'app',
    'models/player'
], function (
    Backbone,
    Kinvey,
    App,
    PlayerModel
) {

    "use strict";

    return Backbone.View.extend({

        id: "login",
        template: App.getTemplate("login"),

        events: {
            "submit": "login"
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },

        login: function (e) {
            var _this = this;

            App.player = new PlayerModel();

            App.player.login(this.$("#email").val(), this.$("#password").val(), {
                success: function () {
                    $('#player-name').html(App.player.get('name'));
                    _this.options.complete.apply(App.router);
                },
                error: function () {
                    alert('Invalid username or password');
                }
            });
            return false;
        }

    });

});
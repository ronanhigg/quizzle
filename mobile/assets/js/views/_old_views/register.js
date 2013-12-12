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

        id: "register",
        template: App.getTemplate("register"),

        events: {
            "submit": "register"
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },

        register: function (e) {
            var _this = this;

            App.player = new PlayerModel();

            App.player.save({
                username: this.$('#email').val(),
                password: this.$('#password').val(),
                name: this.$('#name').val(),
                email: this.$('#email').val()
            })
                .then(function () {
                    App.router.navigate('', {
                        trigger: true
                    });
                }, function () {
                    alert('Error during registration process.');
                });

            return false;
        }

    });

});
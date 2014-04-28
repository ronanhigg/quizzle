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

        className: 'js-stream-logos',
        template: App.getTemplate('quiz-logoquestion'),

        events: {
            'click .js-logoquestion-guess': '_guess'
        },

        initialize: function () {
            var logos = _.clone(this.model.get('otherLogos'));
            logos.push(this.model.get('advertiserLogo'));
            logos = _.shuffle(logos);

            this._correctIndex = _.indexOf(logos, this.model.get('advertiserLogo'));

            this._templateVars = {
                logos: logos
            };
        },

        render: function () {
            this.$el.html(this.template(this._templateVars));
            return this;
        },

        _guess: function (event) {
            var selectedIndex = $(event.currentTarget).data('index');

            if (selectedIndex === this._correctIndex) {
                this.model.trigger('guess:correctlogo');
            } else {
                this.model.trigger('guess:incorrect');
            }

            this.remove();

            return false;
        }

    });

});
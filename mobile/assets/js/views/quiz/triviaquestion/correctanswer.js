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

        className: 'trivia__answer',
        template: App.getTemplate('quiz-triviaquestion-correctanswer'),

        initialize: function () {
            this._templateVars = {
                'correctAnswer': this.model.get('question').correct_answer
            };
        },

        render: function () {
            this.$el.html(this.template(this._templateVars));
            return this;
        }

    });

});
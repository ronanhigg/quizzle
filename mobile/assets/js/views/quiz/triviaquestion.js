/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'vendor/backbone',
    'kinvey',
    'app',

    'views/quiz/triviaquestion/answer',
    'views/quiz/triviaquestion/instruction',
    'views/quiz/triviaquestion/trivia'
], function (
    $,
    _,
    Backbone,
    Kinvey,
    App,

    AnswerView,
    InstructionView,
    TriviaView
) {

    "use strict";

    return Backbone.View.extend({

        template: App.getTemplate('quiz-triviaquestion'),

        events: {
        },

        initialize: function () {
            this.children = [
                new InstructionView({
                    model: this.model
                }),
                new TriviaView({
                    model: this.model
                }),
                new AnswerView({
                    model: this.model
                })
            ];

            this.listenTo(this.model, 'guess:correcttrivia', this._removeInstruction);
            this.listenTo(this.model, 'guess:incorrect', this._removeInstruction);
        },

        render: function () {
            var self = this;

            _.each(this.children, function (child) {
                self.$el.append(child.render().el);
            });

            return this;
        },

        _removeInstruction: function () {
            var instruction = this.children.shift();
            instruction.remove();
        }

    });

});
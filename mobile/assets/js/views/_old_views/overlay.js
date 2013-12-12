/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/backbone',
    'app'
], function ($, Backbone, App) {

    "use strict";

    return Backbone.View.extend({

        className: 'modal',
        template: App.getTemplate('overlay'),

        events: {
            'submit': 'login'
        },

        initialize: function () {
            $('body').append(this.el);
            this.render();
        },

        render: function () {
            var _this = this;

            this.$el.html(this.template(this.options)).modal('show');
            setTimeout(function () {
                //_this.$el.addClass('active');
            }, 0);
            return this;
        },

        hide: function () {
            this.$el.modal('hide');
            this.remove();
        }
        
    });

});
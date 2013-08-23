/* Directives for jslint */
/*global define */

define(['jquery', 'vendor/underscore'], function($, _) {

    "use strict";

    return {
        getTemplate: function (id) {
            return _.template($.trim($("#" + id + "-template").html()));
        }
    }

});
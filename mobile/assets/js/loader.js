/* Directives for jslint */
/*global define */

define([
    'jquery',
    'vendor/underscore',
    'views/overlay'
], function($, _, OverlayView) {

    "use strict";

    var overlay, overlayTimeout;

    return {

        show: function (title) {
            overlayTimeout = setTimeout(function () {
                overlay = new OverlayView({
                    title: title,
                    loading: true
                });
            }, 200);
        },

        hide: function () {
            if (overlay) {
                overlay.hide();
            } else {
                clearTimeout(overlayTimeout);
            }
        }
    }

});
define([
    'jquery',

    'vendor/bootstrap-datepicker',
    'vendor/typeahead'
], function (
    $
) {

    "use strict";

    return {
        'init': function () {

            $('.js-date').datepicker();

            $('.js-typeahead').each(function () {
                var property = $(this).attr('name');
                $(this).typeahead({
                    name: property,
                    prefetch: '/ajax/' + property,
                    ttl: 5000
                })
            });
        }
    };
});
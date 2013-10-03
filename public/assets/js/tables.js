define([
    'jquery'
], function (
    $
) {

    "use strict";

    return {
        'init': function () {

            $('.js-delete').on('click', function () {
                var $deleteModalSubmit = $('#delete-modal-submit'),
                    baseURL = $deleteModalSubmit.data('base-url'),
                    id = $(this).data('id');

                $deleteModalSubmit.attr('href', baseURL + id);

                $('#delete-modal').modal();

                return false;
            });
        }
    };
});
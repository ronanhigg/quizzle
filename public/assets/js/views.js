define([
    'jquery'
], function (
    $
) {

    "use strict";

    return {
        'init': function () {

            $('.js-load-view').on('click', function () {
                var $this = $(this),
                    templateName = $this.data('view-template'),
                    targetName = $this.data('view-target'),

                    $template = $('.js-view-template[data-name="' + templateName + '"]'),
                    $target = $('.js-view-holder[data-view-holder="' + targetName + '"]');

                $target.append(_.template($template.html()));
                return false;
            });

            $('.container').on('click', '.js-remove-parent-view', function () {
                var $this = $(this),
                    targetName = $this.data('view-target'),
                    $target = $this.parents('.js-view[data-name="' + targetName + '"]');

                $target.remove();
                return false;
            });
        }
    };
});
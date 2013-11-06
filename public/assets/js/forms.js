define([
    'jquery',
    'vendor/underscore',

    'vendor/bootstrap-datepicker',
    'vendor/typeahead'
], function (
    $,
    _
) {

    "use strict";

    return {
        'init': function () {

            var that = this;

            $('.js-date').datepicker();

            $('.js-typeahead').each(function () {
                var lastTypeaheadValue,


                    initialValue = $(this).val(),
                    property = $(this).attr('name');

                $(this).typeahead({
                    name: property,
                    prefetch: {
                        url: '/ajax/' + property,
                        ttl: 5000,
                        filter: function (response) {
                            var data = [];
                            _.each(response, function (model, id) {
                                if (typeof model === 'string') {
                                    data.push(model);
                                } else {
                                    data.push({
                                        value: model.name,
                                        model: model
                                    });
                                }
                            });
                            return data;
                        }
                    }
                }).on('typeahead:selected', function (event, datum) {
                    lastTypeaheadValue = datum.value;
                    _.each(datum.model, function (value, key) {
                        if (key !== 'name') {
                            that.updateFormComponentValue(key, value);
                        }
                    });

                }).on('blur', function () {
                    var currentValue = $(this).val();
                    console.log(currentValue, initialValue, lastTypeaheadValue);
                    if (currentValue !== initialValue && currentValue !== lastTypeaheadValue) {
                        that.resetFormComponentsForProperty(property);
                    }
                });
            });
        },

        'updateFormComponentValue': function (key, value) {
            var $el;
            if (key === 'logo_url') {
                $el = $('input[name="' + key + '"]').siblings('img');

                if ($el.length === 0) {
                    $('input[name="' + key + '"]').before('<img>');
                    $el = $('input[name="' + key + '"]').siblings('img');
                }

                $el.attr('src', value);
            } else if (key === 'id') {
                $('input[name="advertiser_id"]').val(value);
            }
        },

        'resetFormComponentsForProperty': function (property) {
            if (property === 'advertiser_name') {
                this.updateFormComponentValue('id', '');
                this.updateFormComponentValue('logo_url', '');
            }
        }
    };
});
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
            $('.js-date').datepicker();

            this.initStatusLabels();
            this.initTypeaheads();
        },

        'initTypeaheads': function () {
            var that = this;

            $('.js-typeahead').each(function () {
                var lastTypeaheadValue,

                    initialValue = $(this).val(),
                    lastValue = initialValue,

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
                    var $statusLabel;

                    lastTypeaheadValue = datum.value;

                    _.each(datum.model, function (value, key) {
                        if (key !== 'name' && key !== '_model_name') {
                            that.updateFormComponentValue(datum.model._model_name, key, value);
                        }
                    });

                    if (datum.model._model_name === 'Model_Advertiser') {
                        $statusLabel = $('#advertiser_status');
                    } else if (datum.model._model_name === 'Model_AdCampaign') {
                        $statusLabel = $('#adcampaign_status');
                    }

                    $statusLabel
                        .removeClass('label-default')
                        .removeClass('label-success')
                        .addClass('label-info')
                        .text($statusLabel.data('status-update'));

                }).on('blur', function () {
                    var $statusLabel,

                        currentValue = $(this).val();

                    if (lastValue !== '') {
                        if (lastValue === initialValue || lastValue === lastTypeaheadValue) {
                            if (currentValue !== initialValue && currentValue !== lastTypeaheadValue) {
                                that.resetFormComponentsForProperty(property);
                            }
                        }
                    }

                    if (property === 'advertiser_name') {
                        $statusLabel = $('#advertiser_status');
                    } else if (property === 'campaign_name') {
                        $statusLabel = $('#adcampaign_status');
                    }

                    if (currentValue !== lastTypeaheadValue) {
                        if (currentValue === '') {
                            $statusLabel
                                .removeClass('label-success')
                                .removeClass('label-info')
                                .addClass('label-default')
                                .text($statusLabel.data('status-empty'));
                        } else {
                            $statusLabel
                                .removeClass('label-default')
                                .removeClass('label-info')
                                .addClass('label-success')
                                .text($statusLabel.data('status-create'));
                        }
                    }

                    lastValue = currentValue;
                });
            });
        },

        'initStatusLabels': function () {
            $('.label-status').each(function () {
                var idInputName,
                    idInputValue,
                    modelName,

                    $this = $(this),
                    id = $this.attr('id');

                if (id === 'advertiser_status') {
                    idInputName = 'advertiser_id';
                    modelName = 'Advertiser';
                } else if (id === 'adcampaign_status') {
                    idInputName = 'adcampaign_id';
                    modelName = 'Ad Campaign';
                }

                idInputValue = $('input[name="' + idInputName + '"]').val();

                $this.data('status-empty', 'No ' + modelName);
                $this.data('status-create', 'Create new ' + modelName);
                $this.data('status-update', 'Update existing ' + modelName);

                if (idInputValue) {
                    $this.addClass('label-info');
                    $this.text($this.data('status-update'));
                } else {
                    $this.addClass('label-default');
                    $this.text($this.data('status-empty'));
                }
            });
        },

        'updateFormComponentValue': function (model, key, value) {
            if (model === 'Model_Advertiser') {
                this.updateModelAdvertiserFormComponentValue(key, value);
            } else if (model === 'Model_AdCampaign') {
                this.updateModelAdCampaignFormComponentValue(key, value);
            }
        },

        'resetFormComponentsForProperty': function (property) {
            if (property === 'advertiser_name') {
                this.updateFormComponentValue('Model_Advertiser', 'id', '');
                this.updateFormComponentValue('Model_Advertiser', 'logo_url', '');
            } else if (property === 'campaign_name') {
                this.updateFormComponentValue('Model_AdCampaign', 'id', '');
                this.updateFormComponentValue('Model_AdCampaign', 'desktop_url', '');
                this.updateFormComponentValue('Model_AdCampaign', 'mobile_url', '');
                this.updateFormComponentValue('Model_AdCampaign', 'first_seen', '');
            }
        },

        'updateModelAdvertiserFormComponentValue': function (key, value) {
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

        'updateModelAdCampaignFormComponentValue': function (key, value) {
            if (key === 'desktop_url' || key === 'mobile_url' || key === 'first_seen') {
                $('input[name="' + key + '"]').val(value);
            } else if (key === 'id') {
                $('input[name="adcampaign_id"]').val(value);
            }
        }
    };
});
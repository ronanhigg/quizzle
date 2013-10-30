<?php

class AdCampaign extends KinveyModel
{
    public static $kinvey_name = 'adcampaigns';

    protected static function validate($params)
    {
        if ( ! array_key_exists('name', $params) || ! $params['name']) {
            throw new Model_AdException('A name is required for an ad campaign');
        }
    }
}

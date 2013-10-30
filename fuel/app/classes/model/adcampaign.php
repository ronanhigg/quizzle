<?php

class Model_AdCampaignException extends Exception {}

class Model_AdCampaign extends KinveyModel
{
    public static $kinvey_name = 'adCampaigns';

    protected static function validate($params)
    {
        if ( ! array_key_exists('name', $params) || ! $params['name']) {
            throw new Model_AdCampaignException('A name is required for an ad campaign');
        }
    }
}

<?php

class Model_AdvertiserException extends Exception {}

class Model_Advertiser extends KinveyModel
{
    public static $kinvey_name = 'advertisers';
    public static $field_name = 'advertiser';

    protected static function validate($params)
    {
        if ( ! array_key_exists('name', $params) || ! $params['name']) {
            throw new Model_AdException('A name is required for an advertiser');
        }

        if ( ! array_key_exists('logo_url', $params) || ! $params['logo_url']) {
            throw new Model_AdException('A logo URL is required for an advertiser');
        }
    }
}

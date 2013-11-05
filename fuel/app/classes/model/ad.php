<?php

class Model_AdException extends Exception {}

class Model_Ad extends KinveyModel
{
    public static $kinvey_name = 'ads';
    public static $field_name = 'ad';

    protected static function validate($params)
    {
        if ( ! array_key_exists('ad_detection_identifier', $params) || ! $params['ad_detection_identifier']) {
            throw new Model_AdException('An ad detection identifier is required for an ad');
        }
    }
}

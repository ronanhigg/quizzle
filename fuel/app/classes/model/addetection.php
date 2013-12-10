<?php

class Model_AdDetectionException extends Exception {}

class Model_AdDetection extends KinveyModel
{
    public static $kinvey_name = 'adDetections';
    
    protected static function validate($params)
    {
    }
}

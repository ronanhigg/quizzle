<?php

class MockS3
{
    private static $putObjectReturnValue = true;
    private static $deleteObjectReturnValue = true;

    public static function setForProcessExecutingCorrectly()
    {
        self::$putObjectReturnValue = true;
        self::$deleteObjectReturnValue = true;
    }

    public static function setForProcessThrowingExceptionOnPutObject()
    {
        self::$putObjectReturnValue = false;
    }

    public static function setForProcessThrowingExceptionOnDeleteObject()
    {
        self::$deleteObjectReturnValue = false;
    }

    public static function inputFile($file, $md5sum)
    {

    }

    public static function putObject($input, $bucket, $uri)
    {
        return self::$putObjectReturnValue;
    }

    public static function deleteObject($bucket, $url)
    {
        return self::$deleteObjectReturnValue;
    }
}
<?php

class Mock_File
{
    private static $deleteReturnValue = true;

    public static function setForProcessExecutingCorrectly()
    {
        self::$deleteReturnValue = true;
    }

    public static function setForProcessThrowingExceptionOnDelete()
    {
        self::$deleteReturnValue = false;
    }

    public static function read($path, $as_string)
    {

    }

    public static function delete($path)
    {
        return self::$deleteReturnValue;
    }
}

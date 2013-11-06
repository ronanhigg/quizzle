<?php

class MockFile
{
    private static $deleteReturnValue = true;

    public static function setForStoreExecutingCorrectly()
    {
        self::$deleteReturnValue = true;
    }

    public static function setForStoreThrowingExceptionOnDelete()
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

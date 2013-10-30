<?php

class Mock_Upload
{
    private static $isValidReturnValue = true;
    private static $getErrorsReturnValue = array();
    private static $getFilesReturnValue = array();

    public static function setForProcessExecutingCorrectly()
    {
        self::$isValidReturnValue = true;
        self::$getErrorsReturnValue = array();
    }

    public static function setForProcessThrowingNoFilesException()
    {
        self::$isValidReturnValue = false;
        self::$getErrorsReturnValue = array(
            array(
                'errors' => array(
                    array(
                        'error' => 9999,
                        'message' => 'Mock message 1',
                    ),
                    array(
                        'error' => 9999,
                        'message' => 'Mock message 2',
                    ),
                ),
            ),
            array(
                'errors' => array(
                    array(
                        'error' => 9999,
                        'message' => 'Mock message 3',
                    ),
                    array(
                        'error' => 9999,
                        'message' => 'Mock message 4',
                    ),
                ),
            ),
        );
    }

    public static function setForProcessThrowingException()
    {
        self::$isValidReturnValue = false;
        self::$getErrorsReturnValue = array(
            array(
                'errors' => array(
                    array(
                        'error' => 1111,
                        'message' => 'Mock message 1',
                    ),
                    array(
                        'error' => 4444,
                        'message' => 'Mock message 2',
                    ),
                ),
            ),
            array(
                'errors' => array(
                    array(
                        'error' => 8888,
                        'message' => 'Mock message 3',
                    ),
                ),
            ),
        );
    }

    public static function setForFindUploadWithFieldNameFindingFieldNamed($field_name)
    {
        $expectedFileData = array(
            'field' => $field_name,
            'other_data' => 3,
        );

        self::$getFilesReturnValue = array(
            $expectedFileData,
            array(
                'field' => 'a_field_not_called_' . $field_name,
                'other_data' => 67,
            ),
        );

        return $expectedFileData;
    }

    public static function setForFindUploadWithFieldNameFindingNoFieldNamed($field_name)
    {
        self::$getFilesReturnValue = array(
            array(
                'field' => 'a_field_not_called_' . $field_name,
                'other_data' => 673,
            ),
        );
    }

    const UPLOAD_ERR_NO_FILE = 9999;

    public static function process()
    {

    }

    public static function is_valid()
    {
        return self::$isValidReturnValue;
    }

    public static function get_errors()
    {
        return self::$getErrorsReturnValue;
        //return call_user_func(array('self', self::$getErrorsMethod));
    }

    public static function save()
    {

    }

    public static function get_files()
    {
        return self::$getFilesReturnValue;
    }
}

<?php

class Adapter_Upload
{
    public function process($config)
    {
        Upload::process($config);
    }

    public function is_valid()
    {
        return Upload::is_valid();
    }

    public function get_errors()
    {
        return Upload::get_errors();
    }

    public function save()
    {
        Upload::save();
    }

    public function get_files()
    {
        return Upload::get_files();
    }

    /* DRAGON - This function is not tested due to the use of a class constant
                from the adaptee.
                -- Conor
    */
    public function is_no_file_error($error)
    {
        return $error['error'] == Upload::UPLOAD_ERR_NO_FILE;
    }
}

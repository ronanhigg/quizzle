<?php

class UploaderException extends Exception {}
class UploaderNoFileException extends UploaderException {}

class Uploader
{
    private $upload_class;

    public function __construct($upload_class)
    {
        $this->upload_class = $upload_class;
    }

    public function process()
    {
        $upload_class = $this->upload_class;

        $upload_class::process(array(
            'overwrite' => true,
            'path' => DOCROOT . 'files',
            'ext_whitelist' => array('jpg', 'wmv'),
            'randomize' => true,
        ));

        if ( ! $upload_class::is_valid()) {
            $has_error_that_isnt_no_file_error = false;
            $error_message = '';
            foreach ($upload_class::get_errors() as $file) {
                foreach ($file['errors'] as $error) {
                    if ($error['error'] != $upload_class::UPLOAD_ERR_NO_FILE) {
                        $has_error_that_isnt_no_file_error = true;
                    }
                    $error_message .= '<p>Error #' . $error['error'] . ': ' . $error['message'] . '</p>';
                }
            }
            if ($has_error_that_isnt_no_file_error) {
                throw new UploaderException($error_message);
            } else {
                throw new UploaderNoFileException($error_message);
            }
        }

        $upload_class::save();
    }

    public function find_upload_with_field_name($name)
    {
        $upload_class = $this->upload_class;

        $files = $upload_class::get_files();
        foreach ($files as $file_data) {
            if ($file_data['field'] == $name) {
                return $file_data;
            }
        }

        throw new UploaderException('No file exists for a field with the name "' . $name . '".');
    }

    /*public static function process()
    {
        Upload::process(array(
            'overwrite' => true,
            'path' => DOCROOT . 'files',
            'ext_whitelist' => array('jpg', 'wmv'),
            'randomize' => true,
        ));

        if ( ! Upload::is_valid()) {
            $has_error_that_isnt_no_file_error = false;
            $error_message = '';
            foreach (Upload::get_errors() as $file) {
                foreach ($file['errors'] as $error) {
                    if ($error['error'] != Upload::UPLOAD_ERR_NO_FILE) {
                        $has_error_that_isnt_no_file_error = true;
                    }
                    $error_message .= '<p>Error #' . $error['error'] . ': ' . $error['message'] . '</p>';
                }
            }
            if ($has_error_that_isnt_no_file_error) {
                throw new UploaderException($error_message);
            } else {
                throw new UploaderNoFileException($error_message);
            }
        }

        Upload::save();
    }

    public static function find_upload_with_field_name($name)
    {
        $files = Upload::get_files();
        foreach ($files as $file_data) {
            if ($file_data['field'] == $name) {
                return $file_data;
            }
        }

        throw new UploaderException('No file exists for a field with the name "' . $name . '".');
    }*/
}

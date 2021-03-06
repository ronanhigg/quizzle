<?php

class UploaderException extends Exception {}
class UploaderNoFileException extends UploaderException {}

class Uploader
{
    private $upload_adapter;

    public function __construct($upload_adapter)
    {
        $this->upload_adapter = $upload_adapter;
    }

    public function process()
    {
        $this->upload_adapter->process(array(
            'overwrite' => true,
            'path' => DOCROOT . 'files',
            'ext_whitelist' => array('jpg', 'png', 'gif', 'wmv'),
            'randomize' => true,
        ));

        if ( ! $this->upload_adapter->is_valid()) {
            $has_error_that_isnt_no_file_error = false;
            $error_message = '';
            foreach ($this->upload_adapter->get_errors() as $file) {
                foreach ($file['errors'] as $error) {
                    if ( ! $this->upload_adapter->is_no_file_error($error)) {
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

        $this->upload_adapter->save();
    }

    public function find_upload_with_field_name($name)
    {
        $files = $this->upload_adapter->get_files();
        foreach ($files as $file_data) {
            if ($file_data['field'] == $name) {
                return $file_data;
            }
        }

        throw new UploaderException('No file exists for a field with the name "' . $name . '".');
    }
}

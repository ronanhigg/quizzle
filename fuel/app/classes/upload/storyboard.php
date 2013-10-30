<?php

class Upload_StoryboardException extends Exception {}

class Upload_StoryboardNoFileException extends Upload_StoryboardException {}

class Upload_Storyboard
{
    const BUCKET = 'appsie-quizzle';

    private $uploader;
    private $cloud_storage_class;
    private $file_class;

    public function __construct($uploader, $cloud_storage_class, $file_class)
    {
        $this->uploader = $uploader;
        $this->cloud_storage_class = $cloud_storage_class;
        $this->file_class = $file_class;
    }

    public function process()
    {
        try {
            $file_data = $this->uploader->find_upload_with_field_name('storyboard_url');
        } catch (UploaderException $e) {
            throw new Upload_StoryboardNoFileException($e->getMessage());
        }

        $file_path = DOCROOT . 'files' . DS . $file_data['saved_as'];

        $input_file = call_user_func(array($this->cloud_storage_class, 'inputFile'), $file_path, false);
        $is_successful = call_user_func(array($this->cloud_storage_class, 'putObject'), $input_file, self::BUCKET, $file_data['saved_as']);

        if ( ! $is_successful) {
            throw new Upload_StoryboardException('An error occurred while uploading the file to AWS S3.');
        }

        $this->delete_file($file_path);

        return 'https://' . Config::get('s3.endpoint') . '/' . self::BUCKET . '/' . $file_data['saved_as'];
    }

    public function remove($url)
    {
        $segments = explode('/', $url);
        $file_name = $segments[count($segments) - 1];

        $is_deleted = call_user_func(array($this->cloud_storage_class, 'deleteObject'), self::BUCKET, $file_name);

        if ( ! $is_deleted) {
            throw new Upload_StoryboardException('Storyboard image was not deleted from AWS S3.');
        }
    }

    public function delete_file($file_path)
    {
        $file_class = $this->file_class;
        $is_uploaded_file_removed = $file_class::delete($file_path);
        
        if ( ! $is_uploaded_file_removed) {
            throw new Upload_StoryboardException('Could not remove uploaded file from local server.');
        }
    }
}

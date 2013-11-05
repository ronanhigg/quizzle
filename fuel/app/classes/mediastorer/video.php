<?php

class MediaStorer_VideoException extends Exception {}

class MediaStorer_VideoNoFileException extends MediaStorer_VideoException {}

class MediaStorer_Video
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
        //throw new MediaStorer_VideoException('Fake error to see if rollback is working...');

        try {
            $file_data = $this->uploader->find_upload_with_field_name('video_url');
        } catch (UploaderException $e) {
            throw new MediaStorer_VideoNoFileException($e->getMessage());
        }

        $file_path = DOCROOT . 'files' . DS . $file_data['saved_as'];

        $input_file = call_user_func(array($this->cloud_storage_class, 'inputFile'), $file_path, false);
        $is_successful = call_user_func(array($this->cloud_storage_class, 'putObject'), $input_file, self::BUCKET, $file_data['saved_as']);

        if ( ! $is_successful) {
            throw new MediaStorer_VideoException('An error occurred while uploading the file to AWS S3.');
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
            throw new MediaStorer_VideoException('Video was not deleted from AWS S3.');
        }
    }

    private function delete_file($file_path)
    {
        $file_class = $this->file_class;
        $is_uploaded_file_removed = $file_class::delete($file_path);
        
        if ( ! $is_uploaded_file_removed) {
            throw new MediaStorer_VideoException('Could not remove uploaded file from local server.');
        }
    }
}

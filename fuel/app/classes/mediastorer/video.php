<?php

class MediaStorer_VideoException extends Exception {}

class MediaStorer_VideoNoFileException extends MediaStorer_VideoException {}

class MediaStorer_Video
{
    const BUCKET = 'appsie-quizzle';

    private $uploader;
    private $cloud_storage_adapter;
    private $file_adapter;

    public function __construct($uploader, $cloud_storage_adapter, $file_adapter)
    {
        $this->uploader = $uploader;
        $this->cloud_storage_adapter = $cloud_storage_adapter;
        $this->file_adapter = $file_adapter;
    }

    public function store()
    {
        //throw new MediaStorer_VideoException('Fake error to see if rollback is working...');

        try {
            $file_data = $this->uploader->find_upload_with_field_name('video_url');
        } catch (UploaderException $e) {
            throw new MediaStorer_VideoNoFileException($e->getMessage());
        }

        $file_path = DOCROOT . 'files' . DS . $file_data['saved_as'];

        $input_file = $this->cloud_storage_adapter->input_file($file_path, false);
        $is_successful = $this->cloud_storage_adapter->put_object($input_file, self::BUCKET, $file_data['saved_as']);

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

        $is_deleted = $this->cloud_storage_adapter->delete_object(self::BUCKET, $file_name);

        if ( ! $is_deleted) {
            throw new MediaStorer_VideoException('Video was not deleted from AWS S3.');
        }
    }

    private function delete_file($file_path)
    {
        $is_uploaded_file_removed = $this->file_adapter->delete($file_path);
        
        if ( ! $is_uploaded_file_removed) {
            throw new MediaStorer_VideoException('Could not remove uploaded file from local server.');
        }
    }
}

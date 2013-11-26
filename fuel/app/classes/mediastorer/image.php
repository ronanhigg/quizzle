<?php

class MediaStorer_ImageException extends Exception {}

class MediaStorer_ImageNoFileException extends MediaStorer_ImageException {}

class MediaStorer_Image
{
    const BUCKET = 'appsie-quizzle';

    private $uploader;

    public function __construct($uploader)
    {
        $this->uploader = $uploader;
    }

    public function store($field_name)
    {
        try {
            $file_data = $this->uploader->find_upload_with_field_name($field_name);
        } catch (UploaderException $e) {
            throw new MediaStorer_ImageNoFileException($e->getMessage());
        }

        $file_path = DOCROOT . 'files' . DS . $file_data['saved_as'];

        $input_file = S3::inputFile($file_path, false);
        $is_successful = S3::putObject($input_file, self::BUCKET, $file_data['saved_as']);

        if ( ! $is_successful) {
            throw new MediaStorer_ImageException('An error occurred while uploading the file to AWS S3.');
        }

        $this->delete_file($file_path);

        return 'https://' . Config::get('s3.endpoint') . '/' . self::BUCKET . '/' . $file_data['saved_as'];
    }

    public function remove($url)
    {
        $segments = explode('/', $url);
        $file_name = $segments[count($segments) - 1];

        $is_deleted = S3::deleteObject(self::BUCKET, $file_name);

        if ( ! $is_deleted) {
            throw new MediaStorer_ImageException('Storyboard image was not deleted from AWS S3.');
        }
    }

    private function delete_file($file_path)
    {
        $is_uploaded_file_removed = File::delete($file_path);
        
        if ( ! $is_uploaded_file_removed) {
            throw new MediaStorer_ImageException('Could not remove uploaded file from local server.');
        }
    }
}

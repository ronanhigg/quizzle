<?php

class Upload_VideoException extends Exception {}

class Upload_VideoNoFileException extends Upload_VideoException {}

class Upload_Video
{
    private static $bucket = 'appsie-quizzle';

    public static function process()
    {
        try {
            $file_data = Uploader::find_upload_with_field_name('video_url');
        } catch (UploaderException $e) {
            throw new Upload_VideoNoFileException($e->getMessage());
        }

        $file_path = DOCROOT . 'files' . DS . $file_data['saved_as'];
        $file_contents = File::read($file_path, true);

        $is_successful = S3::putObject(S3::inputFile($file_path, false), self::$bucket, $file_data['saved_as']);

        if ( ! $is_successful) {
            throw new Upload_VideoException('An error occurred while uploading the file to AWS S3.');
        }

        self::delete_file($file_path);

        return 'https://' . Config::get('s3.endpoint') . '/' . self::$bucket . '/' . $file_data['saved_as'];
    }

    public static function remove($url)
    {
        $segments = explode('/', $url);
        $file_name = $segments[count($segments) - 1];

        $is_deleted = S3::deleteObject(self::$bucket, $file_name);

        if ( ! $is_deleted) {
            throw new Upload_VideoException('Video was not deleted from AWS S3.');
        }
    }

    public static function delete_file($file_path)
    {
        $is_uploaded_file_removed = File::delete($file_path);
        
        if ( ! $is_uploaded_file_removed) {
            throw new Upload_StoryboardException('Could not remove uploaded file from local server.');
        }
    }
}

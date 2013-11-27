<?php

class Adapter_CloudStorage
{
    public function input_file($file, $md5sum)
    {
        return S3::inputFile($file, $md5sum);
    }

    public function put_object($input, $bucket, $uri)
    {
        return S3::putObject($input, $bucket, $uri);
    }

    public function delete_object($bucket, $uri)
    {
        return S3::deleteObject($bucket, $uri);
    }
}

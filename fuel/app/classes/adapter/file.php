<?php

class Adapter_File
{
    public function delete($path)
    {
        return File::delete($path);
    }
}

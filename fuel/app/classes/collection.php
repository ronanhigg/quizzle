<?php

class Collection implements Iterator
{
    protected static $model_class;

    private $_models;

    private $_current;
    private $_position;

    public function __construct()
    {
        $this->_models = array();
    }

    public function fetch_all()
    {
        $class = static::$model_class;
        $url = Config::get('kinvey.base_url') . 'appdata' . DS . Config::get('kinvey.appkey') . DS . $class::$kinvey_name;
        
        $curl = Request::forge($url, 'curl');
        $curl->set_method('GET');
        $curl->http_login(Config::get('kinvey.username'), Config::get('kinvey.password'));

        $curl->execute();

        $response_data = json_decode($curl->response()->body);

        foreach ($response_data as $object) {
            $this->_models[] = new static::$model_class($object);
        }
    }

    public function current()
    {
        return $this->_models[$this->_position];
    }

    public function key()
    {
        return $this->_position;
    }

    public function next()
    {
        $this->_position++;
    }

    public function rewind()
    {
        $this->_position = 0;
    }

    public function valid()
    {
        return $this->_position < count($this->_models);
    }

    public function has_models()
    {
        return count($this->_models) > 0;
    }
}

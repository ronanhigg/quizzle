<?php

class CollectionException extends Exception {}

class Collection implements Iterator
{
    protected static $model_class;

    private $_models;
    private $_model_ids;

    private $_total_models;

    private $_current;
    private $_position;

    public function __construct()
    {
        $this->_models = array();
        $this->_model_ids = array();
    }

    private function fetch($filters = null, $limit = null)
    {
        $class = static::$model_class;
        $url = Config::get('kinvey.base_url') . 'appdata' . DS . Config::get('kinvey.appkey') . DS . $class::$kinvey_name;

        $query_str_elements = array();

        if ($filters) {
            $query_str_elements['query'] = json_encode($filters);
        }

        if (static::$sort_field) {
            $query_str_elements['sort'] = json_encode(array(
                static::$sort_field => static::$sort_order == 'desc' ? -1 : 1,
            ));
        }

        if ($limit) {
            $query_str_elements['limit'] = $limit['amount'];
            $query_str_elements['skip'] = $limit['skip'];
        }

        if (count($query_str_elements) > 0) {
            $url .= '/?' . http_build_query($query_str_elements);
        }
        
        $curl = Request::forge($url, 'curl');
        $curl->set_method('GET');
        $curl->http_login(Config::get('kinvey.username'), Config::get('kinvey.password'));

        try {
            $curl->execute();
        } catch (Exception $e) {
            throw new CollectionException('The request to Kinvey failed. The cURL response is "' . $e->getMessage() . '".');
        }

        $response_data = json_decode($curl->response()->body);

        foreach ($response_data as $object) {
            $model = new static::$model_class($object);
            $this->_models[] = $model;
            $this->_model_ids[] = $model->id;
        }
    }

    public function fetch_all()
    {
        $this->fetch();
    }

    public function fetch_where($filters)
    {
        $this->fetch($filters);
    }

    public function fetch_limited($amount, $skip)
    {
        $this->fetch(null, array(
            'amount' => $amount,
            'skip' => $skip,
        ));
    }

    public function count_all()
    {
        /* DRAGON - This cached total will not update if a model is added or
                    removed after the initial total is calculated and fetched.
                    -- Conor
        */
        if ($this->_total_models) {
            return $this->_total_models;
        }

        $class = static::$model_class;
        $url = Config::get('kinvey.base_url') . 'appdata' . DS . Config::get('kinvey.appkey') . DS . $class::$kinvey_name . DS . '_count';
        
        $curl = Request::forge($url, 'curl');
        $curl->set_method('GET');
        $curl->http_login(Config::get('kinvey.username'), Config::get('kinvey.password'));

        try {
            $curl->execute();
        } catch (Exception $e) {
            throw new CollectionException('The request to Kinvey failed. The cURL response is "' . $e->getMessage() . '".');
        }

        $response_data = json_decode($curl->response()->body);

        $this->_total_models = $response_data->count;

        return $this->_total_models;
    }

    public function get($id)
    {
        $i = array_search($id, $this->_model_ids);
        
        if ($i === false) {
            throw new CollectionException;
        }

        return $this->_models[$i];
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

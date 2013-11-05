<?php

class KinveyModelException extends Exception {}

class KinveyModel
{
    protected static $models = array(
        'ads' => 'Model_Ad',
        'adCampaigns' => 'Model_AdCampaign',
        'advertisers' => 'Model_Advertiser',
        'quizzes' => 'Model_Quiz',
    );

    protected static function get_base_url()
    {
        return Config::get('kinvey.base_url') . 'appdata' . DS . Config::get('kinvey.appkey') . DS . static::$kinvey_name;
    }

    public static function create($params)
    {
        $model = new static($params);
        $model->save();

        return $model;
    }

    public static function find($id)
    {
        $curl = Request::forge(static::get_base_url() . DS . $id, 'curl');
        $curl->set_method('GET');
        $curl->http_login(Config::get('kinvey.username'), Config::get('kinvey.password'));

        try {
            $curl->execute();
        } catch (Exception $e) {
            throw new KinveyModelException('The request to Kinvey failed. The cURL response is "' . $e->getMessage() . '".');
        }

        $response_data = json_decode($curl->response()->body);

        return new static($response_data);
    }

    public function __construct($params)
    {
        foreach ($params as $key => $value) {
            if ($key === '_id') {
                $this->id = $value;
            } else if (substr($key, 0, 1) !== '_') {
                $this->{$key} = $value;
            }
        }
    }

    public function __get($attr)
    {
        return '';
    }

    public function save()
    {
        $params = get_object_vars($this);

        static::validate($params);

        if (isset($this->id)) {
            unset($params['id']);
            $url = static::get_base_url() . DS . $this->id;
            $method = 'PUT';
        } else {
            $url = static::get_base_url();
            $method = 'POST';
        }

        $curl = Request::forge($url, 'curl');
        $curl->set_method($method);
        $curl->set_mime_type('json');
        $curl->http_login(Config::get('kinvey.username'), Config::get('kinvey.password'));

        $curl->set_params($params);

        $curl->execute();

        if ( ! isset($this->id)) {
            $this->id = $curl->response()->body['_id'];
        }
    }

    public function delete()
    {
        $curl = Request::forge(static::get_base_url() . DS . $this->id, 'curl');
        $curl->set_method('DELETE');
        $curl->http_login(Config::get('kinvey.username'), Config::get('kinvey.password'));

        try {
            $curl->execute();
        } catch (Exception $e) {
            throw new KinveyModelException('The cURL request failed. ' . $e->getMessage());
        }
    }

    /* {"_type":"KinveyRef","_collection":"airings","_id":"521785c00d8652150f000001"} */

    public function get_relation($name)
    {
        if ( ! isset($this->{$name})) {
            return null;
        }

        $model_class = static::$models[$this->{$name}->_collection];

        try {
            return $model_class::find($this->{$name}->_id);
        } catch (Exception $e) {
            throw new KinveyModelException;
        }
    }

    public function add_relation($name, $kinvey_name, $foreign_id)
    {
        $this->{$name} = array(
            '_type' => 'KinveyRef',
            '_collection' => $kinvey_name,
            '_id' => $foreign_id,
        );

        $this->save();
    }

    public function remove_relation($name)
    {
        unset($this->{$name});
        $this->save();
    }

    public function get_relations($collection_class)
    {
        $collection = new $collection_class;
        $collection->fetch_where(array(
            static::$field_name => array(
                '_type' => 'KinveyRef',
                '_collection' => static::$kinvey_name,
                '_id' => $this->id,
            ),
        ));
        return $collection;
    }
}

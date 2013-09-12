<?php

class KinveyModel
{
    protected static $base_url = 'http://baas.kinvey.com/appdata/kid_PVgDjNCWFJ/';

    public static function create($params)
    {
        $model = new static($params);
        $model->save();

        return $model;
    }

    public static function find($id)
    {
        $curl = Request::forge(static::$base_url . static::$kinvey_name . '/' . $id, 'curl');
        $curl->set_method('GET');
        $curl->http_login('conor.smith', 'password');

        $curl->execute();

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

    public function save()
    {
        $params = get_object_vars($this);

        static::validate($params);

        if (isset($this->id)) {
            unset($params['id']);
            $url = static::$base_url . static::$kinvey_name . '/' . $this->id;
            $method = 'PUT';
        } else {
            $url = static::$base_url . static::$kinvey_name;
            $method = 'POST';
        }

        $curl = Request::forge($url, 'curl');
        $curl->set_method($method);
        $curl->set_mime_type('json');
        $curl->http_login('conor.smith', 'password');

        $curl->set_params($params);

        $curl->execute();

        if ( ! isset($this->id)) {
            $this->id = $curl->response()->body['_id'];
        }
    }

    public function delete()
    {
        $curl = Request::forge(static::$base_url . static::$kinvey_name . '/' . $this->id, 'curl');
        $curl->set_method('DELETE');
        $curl->set_mime_type('json');
        $curl->http_login('conor.smith', 'password');

        $curl->execute();
    }
}

<?php

class View_Navigation
{
    public static function find_all($request)
    {
        $current_route = $request->uri->get();
        $navigations = array();

        foreach (self::$navs['main'] as $params) {

            if ($params['route'] == $current_route) {
                $params['is_active'] = true;
            } else {
                $params['is_active'] = false;
            }

            $navigations[] = new self($params);
        }

        return $navigations;
    }

    public $label;
    public $route;
    public $li_classes;

    private function __construct($params)
    {
        $this->label = $params['label'];
        $this->route = '/' . $params['route'];

        if ($params['is_active']) {
            $this->li_classes = 'active';
        } else {
            $this->li_classes = '';
        }
    }

    private static $navs = array(
        'main' => array(
            array(
                'label' => 'Home',
                'route' => 'dashboard',
            ),
            array(
                'label' => 'Ads',
                'route' => 'ads',
            ),
        ),
    );
}

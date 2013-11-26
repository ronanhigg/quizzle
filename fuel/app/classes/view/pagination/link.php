<?php

class View_Pagination_Link extends UIComponent
{
    protected $template = 'components/pagination/link';

    public $base_url;
    public $page_number;
    public $label;

    public function __construct($base_url, $page_number)
    {
        $this->base_url = $base_url;
        $this->page_number = $page_number;
        $this->label = $page_number;
    }
}

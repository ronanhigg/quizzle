<?php

class View_Pagination_Current extends UIComponent
{
    protected $template = 'components/pagination/active';

    public $label;

    public function __construct($page_number)
    {
        $this->label = $page_number;
    }
}

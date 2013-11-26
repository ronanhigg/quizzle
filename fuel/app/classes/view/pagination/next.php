<?php

class View_Pagination_Next extends UIComponent
{
    protected $template = 'components/pagination/link';

    public $base_url;
    public $page_number;
    public $label;

    public function __construct($base_url, $current_page, $total_pages)
    {
        if ($current_page == $total_pages) {
            $this->template = 'components/pagination/disabled';
        }

        $this->base_url = $base_url;
        $this->page_number = $current_page + 1;
        $this->label = '&raquo;';
    }
}

<?php

class View_Pagination extends UIComponent
{
    protected $template = 'components/pagination';

    public $page_links;

    private $current_page;
    private $total_pages;
    private $last_displayed_page_number;

    public function __construct($base_url, $current_page, $max_per_page, $total)
    {
        $this->current_page = $current_page;

        $this->total_pages = ceil($total / $max_per_page);

        $this->page_links = array();

        $this->page_links[] = new View_Pagination_Previous($base_url, $current_page);

        for ($i = 1; $i <= $this->total_pages; $i++) {

            if ($i == $current_page) {
                $this->page_links[] = new View_Pagination_Current($i);

            } else if ($this->is_to_display_page_number($i)) {
                $this->page_links[] = new View_Pagination_Link($base_url, $i);
                $this->last_displayed_page_number = $i;

            } else if ($this->is_to_display_ellipsis($i)) {
                $this->page_links[] = new View_Pagination_Ellipsis;
            }
        }

        $this->page_links[] = new View_Pagination_Next($base_url, $current_page, $this->total_pages);
    }

    private function is_to_display_page_number($i)
    {
        if ($i < 3) {
            return true;
        }

        if ($i > $this->total_pages - 2) {
            return true;
        }

        if ($i >= $this->current_page - 1 && $i <= $this->current_page + 1) {
            return true;
        }

        return false;
    }

    private function is_to_display_ellipsis($i)
    {
        return $i == $this->last_displayed_page_number + 1;
    }
}

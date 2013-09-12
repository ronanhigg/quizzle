<?php

class View_Button extends UIComponent
{
    protected $template = 'components/button';

    public $label;
    public $href;

    public function __construct($label, $href)
    {
        $this->label = $label;
        $this->href = $href;
    }
}

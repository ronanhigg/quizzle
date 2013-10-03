<?php

class View_FormElement extends UIComponent
{
    protected $template = 'components/form_element';
    protected $input_template;

    public $label;
    public $key;
    public $input;
    public $value;

    public function __construct($label, $key)
    {
        $this->label = $label;
        $this->key = $key;
        $this->value = '';
    }

    public function set_value($value)
    {
        $this->value = $value;
    }

    public function render()
    {
        $this->input = View::forge($this->input_template, (array) $this);
        return parent::render();
    }
}

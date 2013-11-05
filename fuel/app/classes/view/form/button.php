<?php

class View_Form_Button extends View_FormElement
{
    protected $template = 'components/form_no_label';
    protected $input_template = 'components/form/button';

    public $href;
    public $additional_classes;
    public $data_attributes;

    public function __construct($label, $href, $additional_classes = '', $data_attributes = array())
    {
        parent::__construct($label, '');

        $this->href = $href;
        $this->additional_classes = $additional_classes;
        $this->data_attributes = $data_attributes;
    }
}

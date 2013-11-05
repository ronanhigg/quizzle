<?php

class View_Form_Heading extends View_FormElement
{
    protected $template = 'components/form_no_label';
    protected $input_template = 'components/form/heading';

    public $text;

    public function __construct($text)
    {
        parent::__construct('', '');

        $this->text = $text;
    }
}

<?php

class View_Form_Hidden extends View_FormElement
{
    protected $template = 'components/form_empty';
    protected $input_template = 'components/form/hidden';

    public function __construct($key)
    {
        parent::__construct('', $key);
    }
}

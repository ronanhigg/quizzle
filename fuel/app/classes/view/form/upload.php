<?php

class View_Form_Upload extends View_FormElement
{
    protected $input_template = 'components/form/upload';
    protected $value_template;

    public function set_value($value)
    {
        $this->value = View::forge($this->value_template, array(
            'value' => $value,
        ));
    }
}

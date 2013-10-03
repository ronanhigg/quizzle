<?php

class View_Form_Date extends View_FormElement
{
    protected $input_template = 'components/form/date';

    public $date;

    public function __construct($label, $key)
    {
        parent::__construct($label, $key);

        $today = new DateTime;
        $this->date = $today->format('d-m-Y');
    }
}

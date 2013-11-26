<?php

class UIComponent
{
    protected $template;

    public function render()
    {
        return View::forge($this->template, get_object_vars($this));
    }
}

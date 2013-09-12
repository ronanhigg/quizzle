<?php

class UIComponent
{
    protected $template;

    public function render()
    {
        return View::forge($this->template, (array) $this);
    }
}

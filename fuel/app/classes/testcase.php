<?php

class TestCase extends Fuel\Core\TestCase
{
    /**
     * Define constants after requires/includes
     * Original source: https://gist.github.com/kurtpayne/ec35af03594246c6dd52#file-testcase-php
     * @param Text_Template $template
     * @return void
     */
    public function prepareTemplate(Text_Template $template)
    {
        $property = new ReflectionProperty($template, 'template');
        $property->setAccessible(true);
        $str = $property->getValue($template);
        $str = str_replace('{constants}', '', $str);
        $str .= "\n{constants}\n";
        $property->setValue($template, $str);

        parent::prepareTemplate($template);
    }
}

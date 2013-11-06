<?php

class FormComponentGenerator
{
    public function generate($models, $form_elements)
    {
        if ( ! is_null($models)) {
            foreach ($form_elements as $form_element) {
                if (array_key_exists('model', $form_element)) {
                    $model = $form_element['model'];
                    $component = $form_element['component'];

                    if (array_key_exists('property', $form_element)) {
                        $key = $form_element['property'];
                    } else {
                        $key = $component->key;
                        if (substr($key, -2) == '[]') {
                            $key = substr($key, 0, -2);
                        }
                    }

                    if (isset($models[$model]->{$key})) {
                        $component->set_value($models[$model]->{$key});
                    }
                }
            }
        }

        $components = array_map(function ($form_element) {
            return $form_element['component'];
        }, $form_elements);

        return $components;
    }
}

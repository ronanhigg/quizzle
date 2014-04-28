<?php

use Symfony\Component\Yaml\Yaml;

$yaml = Yaml::parse(file_get_contents(DOCROOT . '../development.env'));

return $yaml['s3'];

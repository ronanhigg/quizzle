<?php

class Collection_Ads extends Collection
{
    protected static $model_class = 'Model_Ad';

    protected static $sort_field = 'ad_detection_identifier';
    protected static $sort_order = 'asc';
}

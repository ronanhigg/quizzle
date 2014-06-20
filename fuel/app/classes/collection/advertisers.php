<?php

class Collection_Advertisers extends Collection
{
    public static $model_class = 'Model_Advertiser';

    protected static $sort_field = 'name';
    protected static $sort_order = 'asc';
}

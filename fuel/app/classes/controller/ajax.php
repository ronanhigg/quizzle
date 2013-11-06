<?php

class Controller_Ajax extends Controller
{
    public function action_advertiser_name()
    {
        //return $this->get_values_for_model_by_property('Collection_Advertisers', 'name');
        return $this->get_collection('Collection_Advertisers');
    }

    public function action_campaign_name()
    {
        return $this->get_values_for_model_property('Collection_AdCampaigns', 'name');
    }

    public function action_agency()
    {
        return $this->get_values_for_ad_property('agency');
    }

    private function get_collection($collection_name)
    {
        $collection = new $collection_name;
        $collection->fetch_all();

        $values = array();

        foreach ($collection as $model) {
            if ( ! array_key_exists($model->id, $values)) {
                $values[$model->id] = $model;
            }
        }

        return Response::forge(json_encode($values));

    }

    private function get_values_for_model_property($collection_name, $property)
    {
        $collection = new $collection_name;
        $collection->fetch_all();

        $values = array();

        foreach ($collection as $model) {
            if ( ! in_array($model->{$property}, $values)) {
                $values[] = $model->{$property};
            }
        }

        return Response::forge(json_encode($values));
    }

    private function get_values_for_ad_property($property)
    {
        $ads = new Collection_Ads;
        $ads->fetch_all();

        $values = array();

        foreach ($ads as $ad) {
            if ( ! in_array($ad->{$property}, $values)) {
                $values[] = $ad->{$property};
            }
        }

        return Response::forge(json_encode($values));
    }
}

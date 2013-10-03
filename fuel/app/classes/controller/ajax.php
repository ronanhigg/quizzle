<?php

class Controller_Ajax extends Controller
{
    public function action_advertiser()
    {
        return $this->get_values_for_ad_property('advertiser');
    }

    public function action_campaign()
    {
        return $this->get_values_for_ad_property('campaign');
    }

    public function action_agency()
    {
        return $this->get_values_for_ad_property('agency');
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

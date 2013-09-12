<?php

class Controller_Ads extends Controller_Base
{
    public function action_index()
    {
        $ads = new Collection_Ads;
        $ads->fetch_all();

        $this->template->title = 'Ads';
        $this->template->primary_actions = array(
            new View_Button('Enter New Ad', '/ads/create'),
        );
        $this->template->content = View::forge('ads/index', array(
            'no_ads' => ! $ads->has_models(),
            'ads' => $ads,
        ));
    }

    public function action_create()
    {
        $this->template->title = 'Enter New Ad';
        $this->template->content = View::forge('ads/form', array(
        ));

        if (Input::method() !== 'POST') {
            return;
        }

        try {
            $ad = Model_Ad::create(array(
                'ad_detection_identifier' => Input::post('ad_detection_identifier'),
            ));
        } catch (Model_AdException $e) {
            Session::set_flash('error', $e->getMessage());
            return;
        }

        Session::set_flash('success', 'The ad has been saved successfully');
        Response::redirect('/ads');
    }

    public function action_update($id)
    {
        try {
            $ad = Model_Ad::find($id);
        } catch (Model_AdException $e) {
            throw new HttpNotFoundException;
        }

        $this->template->title = 'Update Ad';
        $this->template->content = View::forge('ads/form', array(
            'ad' => $ad,
        ));

        if (Input::method() !== 'POST') {
            return;
        }

        $ad->ad_detection_identifier = Input::post('ad_detection_identifier');

        try {
            $ad->save();
        } catch (Model_AdException $e) {
            Session::set_flash('error', $e->getMessage());
            return;
        }

        Session::set_flash('success', 'The ad has been saved successfully');
        Response::redirect('/ads');
    }

    public function action_delete($id)
    {
        try {
            $ad = Model_Ad::find($id);
        } catch (Model_AdException $e) {
            throw new HttpNotFoundException;
        }

        $ad->delete();

        Session::set_flash('success', 'The ad has been deleted successfully');
        Response::redirect('/ads');
    }
}

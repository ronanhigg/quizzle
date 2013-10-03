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
            'components' => $this->generate_form_components(),
        ));

        if (Input::method() !== 'POST') {
            return;
        }

        try {
            Uploader::process();
        } catch (UploaderException $e) {
            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            $storyboard_url = Upload_Storyboard::process();
        } catch (Upload_StoryboardException $e) {
            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            $video_url = Upload_Video::process();
        } catch (Upload_VideoException $e) {
            Upload_Storyboard::remove($storyboard_url);

            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            $ad = Model_Ad::create(array(
                'ad_detection_identifier' => Input::post('ad_detection_identifier'),
                'storyboard_url' => $storyboard_url,
                'video_url' => $video_url,
                'advertiser' => Input::post('advertiser'),
                'campaign' => Input::post('campaign'),
                'campaign_desktop_url' => Input::post('campaign_desktop_url'),
                'campaign_mobile_url' => Input::post('campaign_mobile_url'),
                'campaign_first_seen' => Input::post('campaign_first_seen'),
                'title' => Input::post('title'),
                'ad_first_seen' => Input::post('ad_first_seen'),
                'description' => Input::post('description'),
                'agency' => Input::post('agency'),
            ));
        } catch (Model_AdException $e) {
            Upload_Storyboard::remove($storyboard_url);
            Upload_Video::remove($video_url);

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
            'components' => $this->generate_form_components($ad),
        ));

        if (Input::method() !== 'POST') {
            return;
        }

        try {
            $storyboard_url = Upload_Storyboard::process();
            $original_storyboard_url = $ad->storyboard_url;

        } catch (Upload_StoryboardNoFileException $e) {
            $storyboard_url = $ad->storyboard_url;

        } catch (Upload_StoryboardException $e) {
            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            $video_url = Upload_Video::process();
            $original_video_url = $ad->video_url;

        } catch (Upload_VideoNoFileException $e) {
            $video_url = $ad->video_url;

        } catch (Upload_VideoException $e) {
            Upload_Storyboard::remove($storyboard_url);

            Session::set_flash('error', $e->getMessage());
            return;
        }

        $ad->ad_detection_identifier = Input::post('ad_detection_identifier');
        $ad->storyboard_url = $storyboard_url;
        $ad->video_url = $video_url;
        $ad->advertiser = Input::post('advertiser');
        $ad->campaign = Input::post('campaign');
        $ad->campaign_desktop_url = Input::post('campaign_desktop_url');
        $ad->campaign_mobile_url = Input::post('campaign_mobile_url');
        $ad->campaign_first_seen = Input::post('campaign_first_seen');
        $ad->title = Input::post('title');
        $ad->ad_first_seen = Input::post('ad_first_seen');
        $ad->description = Input::post('description');
        $ad->agency = Input::post('agency');

        try {
            $ad->save();

            if (isset($original_storyboard_url)) {
                Upload_Storyboard::remove($original_storyboard_url);
            }

            if (isset($original_video_url)) {
                Upload_Video::remove($original_video_url);
            }

        } catch (Model_AdException $e) {
            Upload_Storyboard::remove($storyboard_url);
            Upload_Video::remove($video_url);

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

        try {
            Upload_Storyboard::remove($ad->storyboard_url);
        } catch (Upload_StoryboardException $e) {
            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            Upload_Video::remove($ad->video_url);
        } catch (Upload_StoryboardException $e) {
            Session::set_flash('error', $e->getMessage());
            return;
        }

        Session::set_flash('success', 'The ad has been deleted successfully');
        Response::redirect('/ads');
    }

    private function generate_form_components($ad = null)
    {
        $components = array(
            new View_Form_Text('Ad Detection Identifier', 'ad_detection_identifier'),
            new View_Form_Upload_Video('Video', 'video_url'),
            new View_Form_Upload_Image('Ad Storyboard', 'storyboard_url'),

            new View_Form_Typeahead('Advertiser', 'advertiser'),
            // Advertiser Logo selection should go here

            new View_Form_Typeahead('Campaign', 'campaign'),
            new View_Form_Text('Campaign Desktop URL', 'campaign_desktop_url'),
            new View_Form_Text('Campaign Mobile URL', 'campaign_mobile_url'),
            new View_Form_Date('Campaign First Seen', 'campaign_first_seen'),

            new View_Form_Text('Ad Title', 'title'),
            new View_Form_Date('Ad First Seen', 'ad_first_seen'),
            new View_Form_Text_Multiline('Ad Description', 'description'),

            new View_Form_Typeahead('Agency', 'agency'),
        );

        if ( ! is_null($ad)) {
            foreach ($components as $component) {
                if (isset($ad->{$component->key})) {
                    $component->set_value($ad->{$component->key});
                }
            }
        }

        return $components;
    }
}

/* DRAGON - Code below was used in initial attempt to use Kinvey's file storage
            service. It wasn't going anywhere so the above AWS S3 solution was
            devised instead.
            -- Conor
            */

/*
$url = Config::get('kinvey.base_url') . 'blob' . DS . Config::get('kinvey.appkey');

$curl = Request::forge($url, 'curl');
$curl->set_method('POST');
$curl->set_mime_type('json');
$curl->http_login(Config::get('kinvey.username'), Config::get('kinvey.password'));

$curl->set_params(array(
    '_filename' => $file_data['saved_as'],
    '_public' => true,
    'size' => $file_data['size'],
    'mimeType' => 'image/jpeg',
));

$curl->execute();

$response_data = $curl->response()->body;

/*$curl = Request::forge($response_data['_uploadURL'], 'curl');
$curl->set_method('PUT');
$curl->http_login(Config::get('kinvey.username'), Config::get('kinvey.password'));

$curl->set_header('Content-Length', $file_data['size']);
$curl->set_header('Content-Type', 'image/jpeg');

$file_contents = File::read(DOCROOT . 'files' . DS . $file_data['saved_as'], true);
$curl->set_params($file_contents);

$curl->execute();

var_dump($curl->response());*/

/*var_dump($response_data['_uploadURL']);

$file_contents = File::read(DOCROOT . 'files' . DS . $file_data['saved_as'], true);

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $response_data['_uploadURL']);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $file_contents); 
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    //'Content-Type: image/jpeg',
    'Content-Length: ' . $file_data['size'],
)); 

$result = curl_exec($ch);

var_dump($result);
*/

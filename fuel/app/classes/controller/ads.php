<?php

class Controller_AdsException extends Exception {}

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

        $rollback = new Rollback;

        try {
            $this->_post_create($rollback);
        } catch (Controller_AdsException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        Session::set_flash('success', 'The ad has been saved successfully');
        Response::redirect('/ads');
    }

    private function _post_create($rollback)
    {
        $uploader = new Uploader('Upload');

        try {
            $uploader->process();
        } catch (UploaderException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        $image_uploader = new Upload_Image($uploader, 'S3', 'File');

        try {
            $storyboard_url = $image_uploader->process('storyboard_url');
            $rollback->add_call($image_uploader, 'remove', $storyboard_url);

        } catch (Upload_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $logo_url = $image_uploader->process('logo_url');
            $rollback->add_call($image_uploader, 'remove', $logo_url);

        } catch (Upload_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $video_uploader = new Upload_Video($uploader, 'S3', 'File');
            $video_url = $video_uploader->process();
            $rollback->add_call($video_uploader, 'remove', $video_url);

        } catch (Upload_VideoException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $ad = Model_Ad::create(array(
                'ad_detection_identifier' => Input::post('ad_detection_identifier'),
                'storyboard_url' => $storyboard_url,
                'video_url' => $video_url,
                'advertiser' => Input::post('advertiser'),
                'logo_url' => $logo_url,
                'title' => Input::post('title'),
                'ad_first_seen' => Input::post('ad_first_seen'),
                'description' => Input::post('description'),
                'agency' => Input::post('agency'),
            ));
            $rollback->add_call($ad, 'delete');

        } catch (Model_AdException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        if (Input::post('name') || Input::post('desktop_url') || Input::post('mobile_url') || Input::post('first_seen')) {
            try {
                $adcampaign = Model_AdCampaign::create(array(
                    'name' => Input::post('name'),
                    'desktop_url' => Input::post('desktop_url'),
                    'mobile_url' => Input::post('mobile_url'),
                    'first_seen' => Input::post('first_seen'),
                ));
                $rollback->add_call($adcampaign, 'delete');

            } catch (Model_AdCampaignException $e) {
                throw new Controller_AdsException($e->getMessage());
            }
        }

        try {
            $ad->add_relation('adcampaign', 'adCampaigns', $adcampaign->id);
            $rollback->add_call($ad, 'remove_relation', 'adcampaign');
        } catch (Model_AdException $e) {
            throw new Controller_AdsException($e->getMessage());
        }
    }

    public function action_update($id)
    {
        try {
            $ad = Model_Ad::find($id);
            $unmodified_ad = Model_Ad::find($id);

        } catch (Model_AdException $e) {
            throw new HttpNotFoundException;
        }

        try {
            $adcampaign = $ad->get_relation('adcampaign');
            $unmodified_adcampaign = $ad->get_relation('adcampaign');

        } catch (KinveyModelException $e) {
            $adcampaign = null;
            $unmodified_adcampaign = null;
        }

        $this->template->title = 'Update Ad';
        $this->template->content = View::forge('ads/form', array(
            'components' => $this->generate_form_components(array(
                'Ad' => $ad,
                'AdCampaign' => $adcampaign,
            )),
        ));

        if (Input::method() !== 'POST') {
            return;
        }

        $rollback = new Rollback;
        $uploader = new Uploader('Upload');

        try {
            $uploader->process();

        } catch (UploaderNoFileException $e) {

        } catch (UploaderException $e) {
            Session::set_flash('error', $e->getMessage());
            return;
        }

        $image_uploader = new Upload_Image($uploader, 'S3', 'File');

        try {
            $storyboard_url_to_save = $image_uploader->process('storyboard_url');
            $storyboard_url_to_remove = $ad->storyboard_url;
            $rollback->add_call($image_uploader, 'remove', $storyboard_url_to_save);

        } catch (Upload_ImageNoFileException $e) {
            $storyboard_url_to_save = $ad->storyboard_url;
            $storyboard_url_to_remove = null;

        } catch (Upload_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $logo_url_to_save = $image_uploader->process('logo_url');
            $logo_url_to_remove = $ad->logo_url;
            $rollback->add_call($image_uploader, 'remove', $logo_url_to_save);

        } catch (Upload_ImageNoFileException $e) {
            $logo_url_to_save = $ad->storyboard_url;
            $logo_url_to_remove = null;

        } catch (Upload_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $video_uploader = new Upload_Video($uploader, 'S3', 'File');
            $video_url_to_save = $video_uploader->process();
            $video_url_to_remove = $ad->video_url;

            $rollback->add_call($video_uploader, 'remove', $video_url_to_save);

        } catch (Upload_VideoNoFileException $e) {
            $video_url_to_save = $ad->video_url;
            $video_url_to_remove = null;

        } catch (Upload_VideoException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        $ad->ad_detection_identifier = Input::post('ad_detection_identifier');
        $ad->storyboard_url = $storyboard_url_to_save;
        $ad->video_url = $video_url_to_save;
        $ad->advertiser = Input::post('advertiser');
        $ad->logo_url = $logo_url_to_save;
        $ad->title = Input::post('title');
        $ad->ad_first_seen = Input::post('ad_first_seen');
        $ad->description = Input::post('description');
        $ad->agency = Input::post('agency');

        if ($adcampaign) {
            $adcampaign->name = Input::post('name');
            $adcampaign->desktop_url = Input::post('desktop_url');
            $adcampaign->mobile_url = Input::post('mobile_url');
            $adcampaign->first_seen = Input::post('first_seen');
        }

        try {
            $ad->save();
            $rollback->add_call($unmodified_ad, 'save');

        } catch (Model_AdException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        if (Input::post('name')
            || Input::post('desktop_url')
            || Input::post('mobile_url')
            || Input::post('first_seen')) {
            try {
                if (is_null($adcampaign)) {
                    $adcampaign = Model_AdCampaign::create(array(
                        'name' => Input::post('name'),
                        'desktop_url' => Input::post('desktop_url'),
                        'mobile_url' => Input::post('mobile_url'),
                        'first_seen' => Input::post('first_seen'),
                    ));
                    $rollback->add_call($adcampaign, 'delete');
                } else {
                    $adcampaign->save();
                    $rollback->add_call($unmodified_adcampaign, 'save');
                }
            } catch (Model_AdCampaignException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }
        } else if ($adcampaign) {
            try {
                $adcampaign->delete();
                $rollback->add_call($unmodified_adcampaign, 'save');
            } catch (KinveyModelException $e) {
                $rollback->execute();

                Session::set_flash ('error', $e->getMessage());
                return;
            }

            try {
                $ad->remove_relation('adcampaign');
                $rollback->add_call($ad, 'add_relation', array('adcampaign', 'adCampaigns', $unmodified_adcampaign->id));

            } catch (Model_AdException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }
        }

        if ($adcampaign && is_null($unmodified_adcampaign)) {
            try {
                $ad->add_relation('adcampaign', 'adCampaigns', $adcampaign->id);
                $rollback->add_call($ad, 'remove_relation', 'adcampaign');
            } catch (Model_AdException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }
        }

        if ($storyboard_url_to_remove) {
            try {
                $image_uploader->remove($storyboard_url_to_remove);

            } catch (Upload_ImageException $e) {
                $rollback->execute();
                
                Session::set_flash('error', 'An error occurred while saving the ad. ' . $e->getMessage());
                return;
            }
        }

        if ($logo_url_to_remove) {
            try {
                $image_uploader->remove($logo_url_to_remove);

            } catch (Upload_ImageException $e) {
                $rollback->execute();
                
                Session::set_flash('error', 'An error occurred while saving the ad. ' . $e->getMessage());
                return;
            }
        }

        if ($video_url_to_remove) {
            try {
                $video_uploader->remove($video_url_to_remove);

            } catch (Upload_VideoException $e) {
                $rollback->execute();
                
                Session::set_flash('error', 'An error occurred while saving the ad. ' . $e->getMessage());
                return;
            }
        }

        Session::set_flash('success', 'The ad has been saved successfully');
        Response::redirect('/ads/update/' . $ad->id);
    }

    public function action_delete($id)
    {
        try {
            $ad = Model_Ad::find($id);
            $unmodified_ad = Model_Ad::find($id);

        } catch (Model_AdException $e) {
            throw new HttpNotFoundException;
        }

        try {
            $adcampaign = $ad->get_relation('adcampaign');
            $unmodified_adcampaign = $ad->get_relation('adcampaign');

        } catch (KinveyModelException $e) {
            $adcampaign = null;
            $unmodified_adcampaign = null;
        }

        $rollback = new Rollback;
        $uploader = new Uploader('Upload');

        try {
            $ad->delete();
            $rollback->add_call($unmodified_ad, 'save');

        } catch (KinveyModelException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            $adcampaign->delete();
            $rollback->add_call($unmodified_adcampaign, 'save');

        } catch (KinveyModelException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        $image_uploader = new Upload_Image($uploader, 'S3', 'File');

        try {
            $image_uploader->remove($ad->storyboard_url);
        } catch (Upload_ImageException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            $image_uploader->remove($ad->logo_url);
        } catch (Upload_ImageException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            $video_uploader = new Upload_Video($uploader, 'S3', 'File');
            $video_uploader->remove($ad->video_url);
        } catch (Upload_VideoException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        Session::set_flash('success', 'The ad has been deleted successfully');
        Response::redirect('/ads');
    }

    //private function generate_form_components($ad = null)
    private function generate_form_components($models = null)
    {
        $form_elements = array(
            array(
                'component' => new View_Form_Text('Ad Detection Identifier', 'ad_detection_identifier'),
                'model' => 'Ad',
            ),
            array(
                'component' => new View_Form_Upload_Video('Video', 'video_url'),
                'model' => 'Ad',
            ),
            array(
                'component' => new View_Form_Upload_Image('Ad Storyboard', 'storyboard_url'),
                'model' => 'Ad',
            ),

            array(
                'component' => new View_Form_Typeahead('Advertiser', 'advertiser'),
                'model' => 'Ad',
            ),
            array(
                'component' => new View_Form_Upload_Image('Advertiser Logo', 'logo_url'),
                'model' => 'Ad',
            ),

            array(
                'component' => new View_Form_Typeahead('Campaign Name', 'name'),
                'model' => 'AdCampaign',
            ),
            array(
                'component' => new View_Form_Text('Campaign Desktop URL', 'desktop_url'),
                'model' => 'AdCampaign',
            ),
            array(
                'component' => new View_Form_Text('Campaign Mobile URL', 'mobile_url'),
                'model' => 'AdCampaign',
            ),
            array(
                'component' => new View_Form_Date('Campaign First Seen', 'first_seen'),
                'model' => 'AdCampaign',
            ),
            /*new View_Form_Typeahead('Campaign', 'campaign'),
            new View_Form_Text('Campaign Desktop URL', 'campaign_desktop_url'),
            new View_Form_Text('Campaign Mobile URL', 'campaign_mobile_url'),
            new View_Form_Date('Campaign First Seen', 'campaign_first_seen'),*/

            array(
                'component' => new View_Form_Text('Ad Title', 'title'),
                'model' => 'Ad',
            ),
            array(
                'component' => new View_Form_Date('Ad First Seen', 'ad_first_seen'),
                'model' => 'Ad',
            ),
            array(
                'component' => new View_Form_Text_Multiline('Ad Description', 'description'),
                'model' => 'Ad',
            ),

            array(
                'component' => new View_Form_Typeahead('Agency', 'agency'),
                'model' => 'Ad',
            ),
        );

        /* DRAGON - Will need to accept AdCampaign object as well as Ad
                    -- Conor
        */
        if ( ! is_null($models)) {
            foreach ($form_elements as $form_element) {
                $model = $form_element['model'];
                $component = $form_element['component'];
                if (isset($models[$model]->{$component->key})) {
                    $component->set_value($models[$model]->{$component->key});
                }
            }
        }

        $components = array_map(function ($form_element) {
            return $form_element['component'];
        }, $form_elements);

        /*if ( ! is_null($ad)) {
            foreach ($components as $component) {
                if (isset($ad->{$component->key})) {
                    $component->set_value($ad->{$component->key});
                }
            }
        }*/

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

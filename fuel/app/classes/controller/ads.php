<?php

class Controller_AdsException extends Exception {}

class Controller_Ads extends Controller_Base
{
    public function action_index()
    {
        $this->template->title = 'Ads';
        $this->template->primary_actions = array(
            new View_Button('Enter New Ad', '/ads/create'),
        );

        $ads = new Collection_Ads;

        try {
            $ads->fetch_all();

        } catch (CollectionException $e) {
            $this->template->content = View::forge('connection_failure', array(
                'message' => $e->getMessage(),
            ));
            return;
        }

        $this->template->content = View::forge('ads/index', array(
            'no_ads' => ! $ads->has_models(),
            'ads' => $ads,
        ));
    }

    public function action_create()
    {
        $bonus_quizzes = array();
        if (Input::method() === 'POST') {
            foreach (Input::post('question', array()) as $i => $input_question) {
                $bonus_quizzes[] = $this->generate_bonus_quiz_form_components(array(
                    'Quiz' => (object) array(
                        'question' => Input::post("question.$i"),
                        'correct_answer' => Input::post("correct_answer.$i"),
                        'incorrect_answer_1' => Input::post("incorrect_answer_1.$i"),
                        'incorrect_answer_2' => Input::post("incorrect_answer_2.$i"),
                        'incorrect_answer_3' => Input::post("incorrect_answer_3.$i"),
                    ),
                ));
            }
        }

        $this->template->title = 'Enter New Ad';
        $this->template->content = View::forge('ads/form', array(
            'components' => $this->generate_main_form_components(),
            'bonus_quizzes' => $bonus_quizzes,
            'template_bonus_quiz_components' => $this->generate_bonus_quiz_form_components(),
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
        $advertiser_id = Input::post('advertiser_id');

        if ($advertiser_id) {
            try {
                $advertiser = Model_Advertiser::find($advertiser_id);
                $unmodified_advertiser = Model_Advertiser::find($advertiser_id);
            } catch (KinveyModelException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }
        }

        $uploader = new Uploader('Upload');

        try {
            $uploader->process();
        } catch (UploaderException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        $image_storer = new MediaStorer_Image($uploader, 'S3', 'File');

        try {
            $storyboard_url = $image_storer->store('storyboard_url');
            $rollback->add_call($image_storer, 'remove', $storyboard_url);

        } catch (MediaStorer_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $logo_url = $image_storer->store('logo_url');
            $rollback->add_call($image_storer, 'remove', $logo_url);

        } catch (MediaStorer_ImageNoFileException $e) {
            if ($advertiser_id) {
                $logo_url = $advertiser->logo_url;
            } else {
                throw new Controller_AdsException($e->getMessage());
            }

        } catch (MediaStorer_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $video_storer = new MediaStorer_Video($uploader, 'S3', 'File');
            $video_url = $video_storer->store();
            $rollback->add_call($video_storer, 'remove', $video_url);

        } catch (MediaStorer_VideoException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $ad = Model_Ad::create(array(
                'ad_detection_identifier' => Input::post('ad_detection_identifier'),
                'storyboard_url' => $storyboard_url,
                'video_url' => $video_url,
                'title' => Input::post('title'),
                'ad_first_seen' => Input::post('ad_first_seen'),
                'description' => Input::post('description'),
                'agency' => Input::post('agency'),
            ));
            $rollback->add_call($ad, 'delete');

        } catch (Model_AdException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        if ($advertiser_id) {
            $advertiser->name = Input::post('advertiser_name');
            $advertiser->logo_url = $logo_url;

            try {
                $advertiser->save();
                $rollback->add_call($unmodified_advertiser, 'save');
            } catch (Model_AdvertiserException $e) {
                throw new Controller_AdsException($e->getMessage());   
            }
        } else {
            try {
                $advertiser = Model_Advertiser::create(array(
                    'name' => Input::post('advertiser_name'),
                    'logo_url' => $logo_url,
                ));
                $rollback->add_call($advertiser, 'delete');

            } catch (Model_AdvertiserException $e) {
                throw new Controller_AdsException($e->getMessage());
            }
        }

        try {
            $ad->add_relation('advertiser', 'advertisers', $advertiser->id);
            $rollback->add_call($ad, 'remove_relation', 'advertiser');
        } catch (Model_AdException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        if ($this->has_input_for_adcampaign()) {
            try {
                $adcampaign = Model_AdCampaign::create(array(
                    'name' => Input::post('campaign_name'),
                    'desktop_url' => Input::post('desktop_url'),
                    'mobile_url' => Input::post('mobile_url'),
                    'first_seen' => Input::post('first_seen'),
                ));
                $rollback->add_call($adcampaign, 'delete');

            } catch (Model_AdCampaignException $e) {
                throw new Controller_AdsException($e->getMessage());
            }

            try {
                $ad->add_relation('adcampaign', 'adCampaigns', $adcampaign->id);
                $rollback->add_call($ad, 'remove_relation', 'adcampaign');
            } catch (Model_AdException $e) {
                throw new Controller_AdsException($e->getMessage());
            }
        }

        $postinput = new PostInput;

        foreach (Input::post('question', array()) as $i => $question_input) {
            if ($postinput->exists_for_quiz($i)) {
            //if ($this->has_input_for_quiz($i)) {

                try {
                    $quiz = Model_Quiz::create(array(
                        'question' => $question_input,
                        'correct_answer' => Input::post("correct_answer.$i"),
                        'incorrect_answer_1' => Input::post("incorrect_answer_1.$i"),
                        'incorrect_answer_2' => Input::post("incorrect_answer_2.$i"),
                        'incorrect_answer_3' => Input::post("incorrect_answer_3.$i"),
                    ));
                    $rollback->add_call($quiz, 'delete');

                } catch (Model_QuizException $e) {
                    throw new Controller_AdsException($e->getMessage());
                }

                try {
                    $quiz->add_relation('ad', 'ads', $ad->id);
                    $rollback->add_call($quiz, 'remove_relation', 'ad');
                } catch (Model_QuizException $e) {
                    throw new Controller_AdsException($e->getMessage());
                }
            }
        }
    }

    public function action_update($id)
    {
        $this->template->title = 'Update Ad';
        
        try {
            $ad = Model_Ad::find($id);
            $unmodified_ad = Model_Ad::find($id);

        } catch (KinveyModelException $e) {
            $this->template->content = View::forge('connection_failure', array(
                'message' => $e->getMessage(),
            ));
            return;
        }

        try {
            $advertiser = $ad->get_relation('advertiser');
            $unmodified_advertiser = $ad->get_relation('advertiser');

        } catch (KinveyModelException $e) {
            $advertiser = null;
            $unmodified_advertiser = null;
        }

        try {
            $adcampaign = $ad->get_relation('adcampaign');
            $unmodified_adcampaign = $ad->get_relation('adcampaign');

        } catch (KinveyModelException $e) {
            $adcampaign = null;
            $unmodified_adcampaign = null;
        }

        $bonus_quizzes = array();
        if (Input::method() === 'POST') {
            foreach (Input::post('question', array()) as $i => $input_question) {
                $bonus_quizzes[] = $this->generate_bonus_quiz_form_components(array(
                    'Quiz' => (object) array(
                        'question' => Input::post("question.$i"),
                        'correct_answer' => Input::post("correct_answer.$i"),
                        'incorrect_answer_1' => Input::post("incorrect_answer_1.$i"),
                        'incorrect_answer_2' => Input::post("incorrect_answer_2.$i"),
                        'incorrect_answer_3' => Input::post("incorrect_answer_3.$i"),
                    ),
                ));
            }
        } else {
            $quizzes = $ad->get_relations('Collection_Quizzes');
            foreach ($quizzes as $quiz) {
                $bonus_quizzes[] = $this->generate_bonus_quiz_form_components(array(
                    'Quiz' => $quiz,
                ));
            }
        }

        $this->template->content = View::forge('ads/form', array(
            'components' => $this->generate_main_form_components(array(
                'Ad' => $ad,
                'Advertiser' => $advertiser,
                'AdCampaign' => $adcampaign,
            )),
            'bonus_quizzes' => $bonus_quizzes,
            'template_bonus_quiz_components' => $this->generate_bonus_quiz_form_components(),
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

        $image_storer = new MediaStorer_Image($uploader, 'S3', 'File');

        try {
            $storyboard_url_to_save = $image_storer->store('storyboard_url');
            $storyboard_url_to_remove = $ad->storyboard_url;
            $rollback->add_call($image_storer, 'remove', $storyboard_url_to_save);

        } catch (MediaStorer_ImageNoFileException $e) {
            $storyboard_url_to_save = $ad->storyboard_url;
            $storyboard_url_to_remove = null;

        } catch (MediaStorer_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $logo_url_to_save = $image_storer->store('logo_url');
            $logo_url_to_remove = $advertiser->logo_url;
            $rollback->add_call($image_storer, 'remove', $logo_url_to_save);

        } catch (MediaStorer_ImageNoFileException $e) {
            $logo_url_to_save = $advertiser->logo_url;
            $logo_url_to_remove = null;

        } catch (MediaStorer_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
        }

        try {
            $video_storer = new MediaStorer_Video($uploader, 'S3', 'File');
            $video_url_to_save = $video_storer->store();
            $video_url_to_remove = $ad->video_url;

            $rollback->add_call($video_storer, 'remove', $video_url_to_save);

        } catch (MediaStorer_VideoNoFileException $e) {
            $video_url_to_save = $ad->video_url;
            $video_url_to_remove = null;

        } catch (MediaStorer_VideoException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        $ad->ad_detection_identifier = Input::post('ad_detection_identifier');
        $ad->storyboard_url = $storyboard_url_to_save;
        $ad->video_url = $video_url_to_save;
        //$ad->advertiser = Input::post('advertiser');
        //$ad->logo_url = $logo_url_to_save;
        $ad->title = Input::post('title');
        $ad->ad_first_seen = Input::post('ad_first_seen');
        $ad->description = Input::post('description');
        $ad->agency = Input::post('agency');

        if ($adcampaign) {
            $adcampaign->name = Input::post('campaign_name');
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

        $advertiser_id = Input::post('advertiser_id');

        if ($advertiser_id) {
            if ($advertiser_id != $advertiser->id) {
                try {
                    $advertiser = Model_Advertiser::find($advertiser_id);
                    $unmodified_advertiser = Model_Advertiser::find($advertiser_id);
                } catch (KinveyModelException $e) {
                    $rollback->execute();

                    Session::set_flash('error', $e->getMessage());
                    return;
                }

                if (is_null($logo_url_to_remove)) {
                    $logo_url_to_save = $advertiser->logo_url;
                }

                try {
                    $ad->modify_relation('advertiser', $advertiser->id);
                    $rollback->add_call($ad, 'modify_relation', array('advertiser', $unmodified_advertiser->id));
                } catch (Model_AdException $e) {
                    $rollback->execute();

                    Session::set_flash('error', $e->getMessage());
                    return;
                }
            }

            $advertiser->name = Input::post('advertiser_name');
            $advertiser->logo_url = $logo_url_to_save;

            try {
                $advertiser->save();
                $rollback->add_call($unmodified_advertiser, 'save');

            } catch (Model_AdvertiserException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }
        } else {
            try {
                $advertiser = Model_Advertiser::create(array(
                    'name' => Input::post('advertiser_name'),
                    'logo_url' => $logo_url_to_save,
                ));
                $rollback->add_call($advertiser, 'delete');
            } catch (Model_AdvertiserException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }

            try {
                $ad->add_relation('advertiser', 'advertisers', $advertiser->id);
                $rollback->add_call($ad, 'remove_relation', 'advertiser');
            } catch (Model_AdException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }
        }

        if ($this->has_input_for_adcampaign()) {
            try {
                if (is_null($adcampaign)) {
                    $adcampaign = Model_AdCampaign::create(array(
                        'name' => Input::post('campaign_name'),
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

        $remaining_quiz_ids = array();

        if ( ! isset($quizzes)) {
            $quizzes = $ad->get_relations('Collection_Quizzes');
        }

        $postinput = new PostInput;

        foreach (Input::post('question', array()) as $i => $question_input) {
            if ($postinput->exists_for_quiz($i)) {

                $id = Input::post("id.$i");

                if ($id) {
                    $remaining_quiz_ids[] = $id;

                    $quiz = $quizzes->get($id);
                    $unmodified_quiz = $quizzes->get($id);

                    $quiz->question = $question_input;
                    $quiz->correct_answer = Input::post("correct_answer.$i");
                    $quiz->incorrect_answer_1 = Input::post("incorrect_answer_1.$i");
                    $quiz->incorrect_answer_2 = Input::post("incorrect_answer_2.$i");
                    $quiz->incorrect_answer_3 = Input::post("incorrect_answer_3.$i");

                    try {
                        $quiz->save();
                        $rollback->add_call($unmodified_quiz, 'save');

                    } catch (Model_QuizException $e) {
                        $rollback->execute();

                        Session::set_flash('error', $e->getMessage());
                        return;
                    }
                } else {

                    try {
                        $quiz = Model_Quiz::create(array(
                            'question' => $question_input,
                            'correct_answer' => Input::post("correct_answer.$i"),
                            'incorrect_answer_1' => Input::post("incorrect_answer_1.$i"),
                            'incorrect_answer_2' => Input::post("incorrect_answer_2.$i"),
                            'incorrect_answer_3' => Input::post("incorrect_answer_3.$i"),
                        ));
                        $rollback->add_call($quiz, 'delete');

                    } catch (Model_QuizException $e) {
                        $rollback->execute();

                        Session::set_flash('error', $e->getMessage());
                        return;
                    }

                    try {
                        $quiz->add_relation('ad', 'ads', $ad->id);
                        $rollback->add_call($quiz, 'remove_relation', 'ad');
                    } catch (Model_QuizException $e) {
                        $rollback->execute();

                        Session::set_flash('error', $e->getMessage());
                        return;
                    }
                }
            }
        }

        foreach ($quizzes as $quiz) {
            if ( ! in_array($quiz->id, $remaining_quiz_ids)) {
                $unmodified_quiz = $quizzes->get($quiz->id);

                try {
                    $quiz->delete();
                    $rollback->add_call($unmodified_quiz, 'save');

                } catch (KinveyModelException $e) {
                    $rollback->execute();

                    Session::set_flash('error', $e->getMessage());
                    return;
                }
            }
        }

        if ($storyboard_url_to_remove) {
            try {
                $image_storer->remove($storyboard_url_to_remove);

            } catch (MediaStorer_ImageException $e) {
                $rollback->execute();
                
                Session::set_flash('error', 'An error occurred while saving the ad. ' . $e->getMessage());
                return;
            }
        }

        if ($logo_url_to_remove) {
            try {
                $image_storer->remove($logo_url_to_remove);

            } catch (MediaStorer_ImageException $e) {
                $rollback->execute();
                
                Session::set_flash('error', 'An error occurred while saving the ad. ' . $e->getMessage());
                return;
            }
        }

        if ($video_url_to_remove) {
            try {
                $video_storer->remove($video_url_to_remove);

            } catch (MediaStorer_VideoException $e) {
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

        if ($adcampaign) {
            try {
                $adcampaign->delete();
                $rollback->add_call($unmodified_adcampaign, 'save');

            } catch (KinveyModelException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }
        }

        $quizzes = $ad->get_relations('Collection_Quizzes');

        foreach ($quizzes as $quiz) {
            $unmodified_quiz = $quizzes->get($quiz->id);

            try {
                $quiz->delete();
                $rollback->add_call($unmodified_quiz, 'save');

            } catch (KinveyModelException $e) {
                $rollback->execute();

                Session::set_flash('error', $e->getMessage());
                return;
            }
        }

        $image_storer = new MediaStorer_Image($uploader, 'S3', 'File');

        try {
            $image_storer->remove($ad->storyboard_url);
        } catch (MediaStorer_ImageException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        try {
            $video_storer = new MediaStorer_Video($uploader, 'S3', 'File');
            $video_storer->remove($ad->video_url);
        } catch (MediaStorer_VideoException $e) {
            $rollback->execute();

            Session::set_flash('error', $e->getMessage());
            return;
        }

        Session::set_flash('success', 'The ad has been deleted successfully');
        Response::redirect('/ads');
    }

    /*private function generate_form_components($models, $form_elements)
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
    }*/

    private function generate_bonus_quiz_form_components($models = null)
    {
        $formcomponentgenerator = new FormComponentGenerator;
        return $formcomponentgenerator->generate($models, array(
        //return $this->generate_form_components($models, array(
            array(
                'component' => new View_Form_Heading('Bonus Quiz Question'),
            ),
            array(
                'component' => new View_Form_Hidden('id[]'),
                'model' => 'Quiz',
            ),
            array(
                'component' => new View_Form_Text('Question', 'question[]'),
                'model' => 'Quiz',
            ),
            array(
                'component' => new View_Form_Text('Correct Answer', 'correct_answer[]'),
                'model' => 'Quiz',  
            ),
            array(
                'component' => new View_Form_Text('Incorrect Answer', 'incorrect_answer_1[]'),
                'model' => 'Quiz',
            ),
            array(
                'component' => new View_Form_Text('Incorrect Answer', 'incorrect_answer_2[]'),
                'model' => 'Quiz',
            ),
            array(
                'component' => new View_Form_Text('Incorrect Answer', 'incorrect_answer_3[]'),
                'model' => 'Quiz',
            ),
            array(
                'component' => new View_Form_Button('Remove', '#', 'js-remove-parent-view', array(
                    'view-target' => 'bonus-quiz',
                )),
            ),
            array(
                'component' => new View_Separator,
            ),
        ));
    }

    private function generate_main_form_components($models = null)
    {
        $formcomponentgenerator = new FormComponentGenerator;
        return $formcomponentgenerator->generate($models, array(
        //return $this->generate_form_components($models, array(
            array(
                'component' => new View_Form_Heading('Ad Details'),
            ),
            array(
                'component' => new View_Form_Text('Ad Detection Identifier', 'ad_detection_identifier'),
                'model' => 'Ad',
            ),
            array(
                'component' => new View_Form_Text('Ad Title', 'title'),
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

            array(
                'component' => new View_Form_Heading('Advertiser', 'advertiser_status'),
            ),
            array(
                'component' => new View_Form_Hidden('advertiser_id'),
                'model' => 'Advertiser',
                'property' => 'id',
            ),
            array(
                'component' => new View_Form_Typeahead('Advertiser Name', 'advertiser_name'),
                'model' => 'Advertiser',
                'property' => 'name',
            ),
            array(
                'component' => new View_Form_Upload_Image('Advertiser Logo', 'logo_url'),
                'model' => 'Advertiser',
            ),

            array(
                'component' => new View_Form_Heading('Ad Campaign', 'adcampaign_status'),
            ),
            array(
                'component' => new View_Form_Hidden('adcampaign_id'),
                'model' => 'AdCampaign',
                'property' => 'id',
            ),
            array(
                'component' => new View_Form_Typeahead('Campaign Name', 'campaign_name'),
                'model' => 'AdCampaign',
                'property' => 'name',
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
        ));
    }

    private function has_input_for_adcampaign()
    {
        return Input::post('name')
            || Input::post('desktop_url')
            || Input::post('mobile_url')
            || Input::post('first_seen');
    }

    /*private function has_input_for_quiz($i)
    {
        return Input::post("question.$i")
            || Input::post("correct_answer.$i")
            || Input::post("incorrect_answer_1.$i")
            || Input::post("incorrect_answer_2.$i")
            || Input::post("incorrect_answer_3.$i");
    }*/
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

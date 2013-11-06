<?php

class Controller_Advertisers extends Controller_Base
{
    public function action_index()
    {
        $this->template->title = 'Advertisers';
        $this->template->primary_actions = array(
            new View_Button('Enter New Advertiser', '/advertisers/create'),
        );

        $advertisers = new Collection_Advertisers;

        try {
            $advertisers->fetch_all();

        } catch (CollectionException $e) {
            $this->template->content = View::forge('connection_failure', array(
                'message' => $e->getMessage(),
            ));
            return;
        }

        $this->template->content = View::forge('advertisers/index', array(
            'no_advertisers' => ! $advertisers->has_models(),
            'advertisers' => $advertisers,
        ));
    }

    public function action_create()
    {
        $this->template->title = 'Create Advertiser';
        $this->template->primary_actions = array(
            new View_Button('Back', '/advertisers'),
        );

        $this->template->content = View::forge('message', array(
            'message' => 'This action has not been implemented yet.',
        ));
    }

    public function action_update($id)
    {
        $this->template->title = 'Update Advertiser';

        try {
            $advertiser = Model_Advertiser::find($id);
            $unmodified_advertiser = Model_Advertiser::find($id);

        } catch (KinveyModelException $e) {
            $this->template->content = View::forge('connection_failure', array(
                'message' => $e->getMessage(),
            ));
            return;
        }

        $loaded_quizzes = array();
        if (Input::method() === 'POST') {
            foreach (Input::post('question', array()) as $i => $input_question) {
                $loaded_quizzes[] = $this->generate_quiz_form_components(array(
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
            $quizzes = $advertiser->get_relations('Collection_Quizzes');
            foreach ($quizzes as $quiz) {
                $loaded_quizzes[] = $this->generate_quiz_form_components(array(
                    'Quiz' => $quiz,
                ));
            }
        }

        $this->template->content = View::forge('advertisers/form', array(
            'components' => $this->generate_main_form_components(array(
                'Advertiser' => $advertiser,
            )),
            'loaded_quizzes' => $loaded_quizzes,
            'template_quiz_components' => $this->generate_quiz_form_components(),
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
            $logo_url_to_save = $image_storer->store('logo_url');
            $logo_url_to_remove = $advertiser->logo_url;
            $rollback->add_call($image_storer, 'remove', $logo_url_to_save);

        } catch (MediaStorer_ImageNoFileException $e) {
            $logo_url_to_save = $advertiser->logo_url;
            $logo_url_to_remove = null;

        } catch (MediaStorer_ImageException $e) {
            throw new Controller_AdsException($e->getMessage());
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

        $remaining_quiz_ids = array();

        if ( ! isset($quizzes)) {
            $quizzes = $advertiser->get_relations('Collection_Quizzes');
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
                        $quiz->add_relation('advertiser', 'advertisers', $advertiser->id);
                        $rollback->add_call($quiz, 'remove_relation', 'advertiser');
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

        if ($logo_url_to_remove) {
            try {
                $image_storer->remove($logo_url_to_remove);

            } catch (MediaStorer_ImageException $e) {
                $rollback->execute();
                
                Session::set_flash('error', 'An error occurred while saving the ad. ' . $e->getMessage());
                return;
            }
        }

        Session::set_flash('success', 'The advertiser has been saved successfully');
        Response::redirect('/advertisers/update/' . $advertiser->id);
    }

    public function action_delete($id)
    {
        $this->template->title = 'Delete Advertiser';
        $this->template->primary_actions = array(
            new View_Button('Back', '/advertisers'),
        );

        $this->template->content = View::forge('message', array(
            'message' => 'This action has not been implemented yet.',
        ));
    }

    private function generate_main_form_components($models = null)
    {
        $formcomponentgenerator = new FormComponentGenerator;
        return $formcomponentgenerator->generate($models, array(
            array(
                'component' => new View_Form_Text('Advertiser Name', 'advertiser_name'),
                'model' => 'Advertiser',
                'property' => 'name',
            ),
            array(
                'component' => new View_Form_Upload_Image('Advertiser Logo', 'logo_url'),
                'model' => 'Advertiser',
            ),
        ));
    }

    private function generate_quiz_form_components($models = null)
    {
        $formcomponentgenerator = new FormComponentGenerator;
        return $formcomponentgenerator->generate($models, array(
            array(
                'component' => new View_Form_Heading('Quiz Question'),
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
                    'view-target' => 'quiz',
                )),
            ),
            array(
                'component' => new View_Separator,
            ),
        ));
    }
}

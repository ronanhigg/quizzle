<?php

class PostInput
{
    public function exists_for_quiz($i)
    {
        return Input::post("question.$i")
            || Input::post("correct_answer.$i")
            || Input::post("incorrect_answer_1.$i")
            || Input::post("incorrect_answer_2.$i")
            || Input::post("incorrect_answer_3.$i");
    }
}

<?php

class Model_QuizException extends Exception {}

class Model_Quiz extends KinveyModel
{
    public static $kinvey_name = 'quizzes';

    protected static function validate($params)
    {
        if ( ! array_key_exists('question', $params) || ! $params['question']) {
            throw new Model_QuizException('A question is required for a quiz');
        }

        if ( ! array_key_exists('correct_answer', $params) || ! $params['correct_answer']) {
            throw new Model_QuizException('A correct answer is required for a quiz');
        }

        if ( ! array_key_exists('incorrect_answer_1', $params) || ! $params['incorrect_answer_1']) {
            throw new Model_QuizException('Three incorrect answers are required for a quiz');
        }

        if ( ! array_key_exists('incorrect_answer_2', $params) || ! $params['incorrect_answer_2']) {
            throw new Model_QuizException('Three incorrect answers are required for a quiz');
        }

        if ( ! array_key_exists('incorrect_answer_3', $params) || ! $params['incorrect_answer_3']) {
            throw new Model_QuizException('Three incorrect answers are required for a quiz');
        }
    }
}

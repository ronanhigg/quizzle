<?php

class Rollback
{
    private $calls;
    private $has_executed;
    private $call_counter;
    private $has_exceeded_max_calls;

    const MAX_CALLS = 5;

    public function __construct()
    {
        $this->calls = array();
        $this->has_executed = false;
        $this->call_counter = 0;
        $this->has_exceeded_max_calls = false;
    }

    public function add_call($object, $function, $parameter = null)
    {
        $this->calls[] = array(
            'object' => $object,
            'function' => $function,
            'parameter' => $parameter,
        );
    }

    public function execute()
    {
        if ($this->has_executed) {
            throw new LogicException('The rollback functions have already been executed once.');
        }

        foreach ($this->calls as $call) {
            $this->reset_call_counter();
            $this->execute_call($call);
        }

        $this->has_executed = true;
    }

    public function has_executed_successfully()
    {
        return $this->has_executed && ! $this->has_exceeded_max_calls;
    }

    private function execute_call($call)
    {
        if ($this->call_counter >= self::MAX_CALLS) {
            $this->has_exceeded_max_calls = true;
            return;
        }

        $this->call_counter++;

        try {
            if (is_null($call['parameter'])) {
                call_user_func(array($call['object'], $call['function']));
            } else {
                call_user_func(array($call['object'], $call['function']), $call['parameter']);
            }
        } catch (Exception $e) {
            $this->execute_call($call);
        }
    }

    private function reset_call_counter()
    {
        $this->call_counter = 0;
    }
}

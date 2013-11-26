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
        if (is_array($parameter)) {
            $param_array = $parameter;
        } else {
            $param_array = array($parameter);
        }
        $this->_add_call($object, $function, $param_array);
    }

    public function add_call_with_single_param($object, $function, $parameter)
    {
        $this->_add_call($object, $function, array($parameter));
    }

    private function _add_call($object, $function, $param_array)
    {
        $this->calls[] = array(
            'object' => $object,
            'function' => $function,
            'param_array' => $param_array,
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
            call_user_func_array(array($call['object'], $call['function']), $call['param_array']);
        } catch (Exception $e) {
            $this->execute_call($call);
        }
    }

    private function reset_call_counter()
    {
        $this->call_counter = 0;
    }
}

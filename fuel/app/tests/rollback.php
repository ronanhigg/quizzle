<?php

/**
 * @group App
 */
class Test_Rollback extends TestCase
{
    public function setUp()
    {
        $this->calledMethod = 'calledMethod';
        $this->testParam = 'test_param';
    }

    private function setUpMockCalledObject()
    {
        $calledObject = $this->getMockBuilder('CalledObject')
            ->disableOriginalConstructor()
            ->setMethods(array($this->calledMethod))
            ->getMock();

        return $calledObject;
    }

    /**
     * @test
     */
    public function constructorCorrectlyInitialises()
    {
        $rollback = new Rollback;

        $this->assertInstanceOf(
            'Rollback',
            $rollback,
            'Rollback::__construct() did not return a Rollback object'
        );

        $this->assertFalse(
            $rollback->has_executed_successfully(),
            'Rollback::has_executed_successfully() did not return false after object is constructed'
        );
    }

    /**
     * @test
     */
    public function executeWorksWhenOneCallHasBeenAddedWithNoParameter()
    {
        $calledObject = $this->setUpMockCalledObject();

        $calledObject->expects($this->once())
            ->method($this->calledMethod);

        $rollback = new Rollback;

        $rollback->add_call($calledObject, $this->calledMethod);
        $rollback->execute();

        $this->assertTrue(
            $rollback->has_executed_successfully(),
            'Rollback::has_executed_successfully() did not return true after normal execution'
        );
    }

    /**
     * @test
     */
    public function executeWorksWhenOneCallHasBeenAddedWithAParameter()
    {
        $calledObject = $this->setUpMockCalledObject();

        $calledObject->expects($this->once())
            ->method($this->calledMethod)
            ->with($this->equalTo($this->testParam));

        $rollback = new Rollback;

        $rollback->add_call($calledObject, $this->calledMethod, $this->testParam);
        $rollback->execute();

        $this->assertTrue(
            $rollback->has_executed_successfully(),
            'Rollback::has_executed_successfully() did not return true after normal execution'
        );
    }

    /**
     * @test
     */
    public function executeWorksWhenOneCallHasBeenAddedWithParameterArray()
    {
        $calledObject = $this->setUpMockCalledObject();

        $calledObject->expects($this->once())
            ->method($this->calledMethod)
            ->with(
                $this->equalTo('paramA'),
                $this->equalTo('paramB'),
                $this->equalTo('paramC')
            );

        $rollback = new Rollback;

        $rollback->add_call($calledObject, $this->calledMethod, array('paramA', 'paramB', 'paramC'));
        $rollback->execute();

        $this->assertTrue(
            $rollback->has_executed_successfully(),
            'Rollback::has_executed_successfully() did not return true after normal execution'
        );
    }

    /**
     * @test
     */
    public function executeWorksWhenOneCallHasBeenAddedWithAParameterThatsAnArray()
    {
        $calledObject = $this->setUpMockCalledObject();

        $calledObject->expects($this->once())
            ->method($this->calledMethod)
            ->with($this->equalTo(array('elA', 'elB', 'elC')));

        $rollback = new Rollback;

        $rollback->add_call_with_single_param($calledObject, $this->calledMethod, array('elA', 'elB', 'elC'));
        $rollback->execute();

        $this->assertTrue(
            $rollback->has_executed_successfully(),
            'Rollback::has_executed_successfully() did not return true after normal execution'
        );
    }

    /**
     * @test
     */
    public function executeWorksWhenTheAddedCallThrowsAnExceptionBeforeRunningSuccessfully()
    {
        $calledObject = $this->setUpMockCalledObject();

        $calledObject->expects($this->at(0))
            ->method($this->calledMethod)
            ->with($this->equalTo($this->testParam))
            ->will($this->throwException(new Exception));

        $calledObject->expects($this->at(1))
            ->method($this->calledMethod)
            ->with($this->equalTo($this->testParam));

        $rollback = new Rollback;

        $rollback->add_call($calledObject, $this->calledMethod, $this->testParam);
        $rollback->execute();

        $this->assertTrue(
            $rollback->has_executed_successfully(),
            'Rollback::has_executed_successfully() did not return true after execution where a single exception is thrown'
        );
    }

    /**
     * @test
     */
    public function executeWorksWhenTheAddedCallCannotRunSuccessfully()
    {
        $calledObject = $this->setUpMockCalledObject();

        $calledObject->expects($this->exactly(Rollback::MAX_CALLS))
            ->method($this->calledMethod)
            ->with($this->equalTo($this->testParam))
            ->will($this->throwException(new Exception));

        $rollback = new Rollback;

        $rollback->add_call($calledObject, $this->calledMethod, $this->testParam);
        $rollback->execute();

        $this->assertFalse(
            $rollback->has_executed_successfully(),
            'Rollback::has_executed_successfully() did not return false after execution where Rollback::MAX_CALLS exceptions are thrown'
        );
    }

    /**
     * @test
     * @expectedException LogicException
     */
    public function executeCanOnlyRunOnce()
    {
        $calledObject = $this->setUpMockCalledObject();

        $calledObject->expects($this->once())
            ->method($this->calledMethod);

        $rollback = new Rollback;

        $rollback->add_call($calledObject, $this->calledMethod);
        $rollback->execute();

        $rollback->execute();
    }
}
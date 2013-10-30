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

    public function testConstructor()
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

    public function testAddCallAndExecuteWithoutParam()
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

    public function testAddCallAndExecuteWithParam()
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

    public function testAddCallAndExecuteWithMethodThrowingAnExceptionOnce()
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

    public function testAddCallAndExecuteWithMethodAlwaysThrowingAnException()
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
     * @expectedException LogicException
     */
    public function testExecuteCanOnlyRunOnce()
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
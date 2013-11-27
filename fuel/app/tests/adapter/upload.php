<?php

/**
 * @group FullApp
 * @group Adapters
 */
class Test_Adapter_Upload extends TestCase
{
    public function setUp()
    {
        $this->uploadAdapter = new Adapter_Upload;
    }

    public function tearDown()
    {
        Mockery::close();
    }

    /**
     * @test
     */
    public function processInvokesProcessFromAdaptee()
    {
        $config = array(
            'just' => 'some',
            'various' => 'params',
        );

        Mockery::mock('alias:Upload')
            ->shouldReceive('process')
            ->once()
            ->with($config);

        $this->uploadAdapter->process($config);
    }

    /**
     * @test
     */
    public function isValidReturnsResultOfIsValidFromAdaptee()
    {
        $fixtures = array(
            array(
                'result' => true,
            ),
            array(
                'result' => false,
            ),
        );

        $mock = Mockery::mock('alias:Upload');

        foreach ($fixtures as $fixture) {

            $mock->shouldReceive('is_valid')
                ->once()
                ->andReturn($fixture['result']);

            $actualResult = $this->uploadAdapter->is_valid();

            $this->assertEquals(
                $fixture['result'],
                $actualResult,
                'Adapter_Upload::is_valid() did not return ' . ($fixture['result'] ? 'true' : 'false') . ' as expected'
            );
        }
    }

    /**
     * @test
     */
    public function getErrorsReturnsResultOfGetErrorsFromAdaptee()
    {
        $fixtures = array(
            array(
                'result' => array(
                    array(
                        'errors' => array(
                            array(
                                'error' => 9999,
                                'message' => 'Mock message 1',
                            ),
                            array(
                                'error' => 9999,
                                'message' => 'Mock message 2',
                            ),
                        ),
                    ),
                    array(
                        'errors' => array(
                            array(
                                'error' => 9999,
                                'message' => 'Mock message 3',
                            ),
                            array(
                                'error' => 9999,
                                'message' => 'Mock message 4',
                            ),
                        ),
                    ),
                ),
            ),
            array(
                'result' => array(
                    array(
                        'errors' => array(
                            array(
                                'error' => 9999,
                                'message' => 'Mock message 1',
                            ),
                            array(
                                'error' => 9999,
                                'message' => 'Mock message 2',
                            ),
                        ),
                    ),
                ),
            ),
            array(
                'result' => array(),
            ),
        );

        $mock = Mockery::mock('alias:Upload');

        foreach ($fixtures as $fixture) {

            $mock->shouldReceive('get_errors')
                ->once()
                ->andReturn($fixture['result']);

            $actualResult = $this->uploadAdapter->get_errors();

            $this->assertEquals(
                $fixture['result'],
                $actualResult,
                'Adapter_Upload::get_errors() did not return the expected result'
            );
        }
    }

    /**
     * @test
     */
    public function saveInvokesSaveFromAdaptee()
    {
        Mockery::mock('alias:Upload')
            ->shouldReceive('save')
            ->once();

        $this->uploadAdapter->save();
    }

    /**
     * @test
     */
    public function getFilesReturnsResultOfGetFilesFromAdaptee()
    {
        $fixtures = array(
            array(
                'result' => array(
                    array(
                        'field' => 'a_field_called_bob',
                        'other_data' => 7,
                    ),
                    array(
                        'field' => 'a_field_not_called_bill',
                        'other_data' => 67,
                    ),
                ),
            ),
            array(
                'result' => array(
                    array(
                        'field' => 'a_field_called_bob',
                        'other_data' => 7,
                    ),
                ),
            ),
            array(
                'result' => array(),
            ),
        );

        $mock = Mockery::mock('alias:Upload');

        foreach ($fixtures as $fixture) {

            $mock->shouldReceive('get_files')
                ->once()
                ->andReturn($fixture['result']);

            $actualResult = $this->uploadAdapter->get_files();

            $this->assertEquals(
                $fixture['result'],
                $actualResult,
                'Adapter_Upload::get_files() did not return the expected result'
            );
        }
    }
}

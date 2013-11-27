<?php

/**
 * @group FullApp
 * @group App
 */
class Test_Uploader extends TestCase
{
    public function setUp()
    {
        $this->uploadAdapter = $this->setUpMockUploadAdapter();
        $this->uploader = new Uploader($this->uploadAdapter);
    }

    public function tearDown()
    {
        Mockery::close();
    }

    public function setUpMockUploadAdapter()
    {
        return Mockery::mock('Adapter_Upload');
    }

    /**
     * @test
     */
    public function processWorks()
    {
        $this->uploadAdapter
            ->shouldReceive('process')
            ->once();

        $this->uploadAdapter
            ->shouldReceive('is_valid')
            ->once()
            ->andReturn(true);

        $this->uploadAdapter
            ->shouldReceive('save')
            ->once();

        $this->uploader->process();
    }

    /**
     * @test
     * @expectedException UploaderNoFileException
     */
    public function processHandlesUploadUtilityHavingNoFiles()
    {
        $this->uploadAdapter
            ->shouldReceive('process')
            ->once();

        $this->uploadAdapter
            ->shouldReceive('is_valid')
            ->once()
            ->andReturn(false);

        $this->uploadAdapter
            ->shouldReceive('get_errors')
            ->once()
            ->andReturn(array(
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
            ));

        $this->uploadAdapter
            ->shouldReceive('is_no_file_error')
            ->times(4)
            ->andReturn(true);

        $this->uploader->process();
    }

    /**
     * @test
     * @expectedException UploaderException
     */
    public function processHandlesUploadUtiliyThrowingAnException()
    {
        $this->uploadAdapter
            ->shouldReceive('process')
            ->once();

        $this->uploadAdapter
            ->shouldReceive('is_valid')
            ->once()
            ->andReturn(false);

        $this->uploadAdapter
            ->shouldReceive('get_errors')
            ->once()
            ->andReturn(array(
                array(
                    'errors' => array(
                        array(
                            'error' => 1111,
                            'message' => 'Mock message 1',
                        ),
                        array(
                            'error' => 4444,
                            'message' => 'Mock message 2',
                        ),
                    ),
                ),
                array(
                    'errors' => array(
                        array(
                            'error' => 8888,
                            'message' => 'Mock message 3',
                        ),
                    ),
                ),
            ));

        $this->uploadAdapter
            ->shouldReceive('is_no_file_error')
            ->times(3)
            ->andReturn(true, false, true);

        $this->uploader->process();
    }

    /**
     * @test
     */
    public function findUploadWithFieldNameReturnsFileData()
    {
        $field_name = 'test_upload_field';

        $this->uploadAdapter
            ->shouldReceive('get_files')
            ->once()
            ->andReturn(array(
                array(
                    'field' => $field_name,
                    'other_data' => 3,
                ),
                array(
                    'field' => 'a_field_not_called_test_upload_field',
                    'other_data' => 67,
                ),
            ));

        $actualFileData = $this->uploader->find_upload_with_field_name($field_name);

        $this->assertEquals(
            array(
                'field' => $field_name,
                'other_data' => 3,
            ),
            $actualFileData,
            'Uploader::find_upload_with_field_name() does not return the expected file data'
        );
    }

    /**
     * @test
     * @expectedException UploaderException
     */
    public function findUploadWithFieldNameHandlesNonexistantFieldName()
    {
        $this->uploadAdapter
            ->shouldReceive('get_files')
            ->once()
            ->andReturn(array(
                array(
                    'field' => 'a_field_not_called_test_upload_field',
                    'other_data' => 67,
                ),
            ));

        $this->uploader->find_upload_with_field_name('test_upload_field');
    }
}

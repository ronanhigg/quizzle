<?php

/**
 * @group App
 */
class Test_Uploader extends TestCase
{
    public function setUp()
    {
        $this->uploader = new Uploader('Mock_Upload');
    }

    /**
     * @test
     */
    public function constructorCorrectlyInitialisesAndProcessWorks()
    {
        Mock_Upload::setForProcessExecutingCorrectly();
        $this->uploader->process();

        $this->assertInstanceOf(
            'Uploader',
            $this->uploader,
            'Uploader::__construct() did not return an Uploader object'
        );
    }

    /**
     * @test
     * @expectedException UploaderNoFileException
     */
    public function processHandlesUploadUtilityHavingNoFiles()
    {
        Mock_Upload::setForProcessThrowingNoFilesException();
        $this->uploader->process();
    }

    /**
     * @test
     * @expectedException UploaderException
     */
    public function processHandlesUploadUtiliyThrowingAnException()
    {
        Mock_Upload::setForProcessThrowingException();
        $this->uploader->process();
    }

    /**
     * @test
     */
    public function findUploadWithFieldNameReturnsFileData()
    {
        $expectedFileData = Mock_Upload::setForFindUploadWithFieldNameFindingFieldNamed('test_upload_field');
        $actualFileData = $this->uploader->find_upload_with_field_name('test_upload_field');

        $this->assertEquals(
            $actualFileData,
            $expectedFileData,
            'Uploader::find_upload_with_field_name() does not return the expected file data'
        );
    }

    /**
     * @test
     * @expectedException UploaderException
     */
    public function findUploadWithFieldNameHandlesNonexistantFieldName()
    {
        Mock_Upload::setForFindUploadWithFieldNameFindingNoFieldNamed('test_upload_field');
        $this->uploader->find_upload_with_field_name('test_upload_field');
    }
}

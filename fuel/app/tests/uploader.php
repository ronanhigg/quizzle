<?php

/**
 * @group App
 */
class Test_Uploader extends TestCase
{
    public function setUp()
    {
        $this->uploader = new Uploader('MockUpload');
    }

    /**
     * @test
     */
    public function constructorCorrectlyInitialisesAndProcessWorks()
    {
        MockUpload::setForProcessExecutingCorrectly();
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
        MockUpload::setForProcessThrowingNoFilesException();
        $this->uploader->process();
    }

    /**
     * @test
     * @expectedException UploaderException
     */
    public function processHandlesUploadUtiliyThrowingAnException()
    {
        MockUpload::setForProcessThrowingException();
        $this->uploader->process();
    }

    /**
     * @test
     */
    public function findUploadWithFieldNameReturnsFileData()
    {
        $expectedFileData = MockUpload::setForFindUploadWithFieldNameFindingFieldNamed('test_upload_field');
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
        MockUpload::setForFindUploadWithFieldNameFindingNoFieldNamed('test_upload_field');
        $this->uploader->find_upload_with_field_name('test_upload_field');
    }
}

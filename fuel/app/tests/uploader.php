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

    public function testProcess()
    {
        Mock_Upload::setForProcessExecutingCorrectly();
        $this->uploader->process();
    }

    /**
     * @expectedException UploaderNoFileException
     */
    public function testProcessThrowingNoFilesException()
    {
        Mock_Upload::setForProcessThrowingNoFilesException();
        $this->uploader->process();

        $this->assertInstanceOf(
            'Uploader',
            $this->uploader,
            'Uploader::__construct() did not return an Uploader object'
        );
    }

    /**
     * @expectedException UploaderException
     */
    public function testProcessThrowingException()
    {
        Mock_Upload::setForProcessThrowingException();
        $this->uploader->process();
    }

    public function testFindUploadWithFieldName()
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
     * @expectedException UploaderException
     */
    public function testFindUploadWithFieldNameThrowingException()
    {
        Mock_Upload::setForFindUploadWithFieldNameFindingNoFieldNamed('test_upload_field');
        $this->uploader->find_upload_with_field_name('test_upload_field');
    }
}

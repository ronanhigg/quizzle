<?php

/**
 * @group App
 */
class Test_Upload_Video extends TestCase
{
    public function setUp()
    {
        $this->savedAsValue = 'randomfilename';
    }

    private function setUpVideoUploader($uploader)
    {
        return new Upload_Video($uploader, 'Mock_S3', 'Mock_File');
    }

    private function setUpMockUploader()
    {
        $uploader = $this->getMockBuilder('Uploader')
            ->disableOriginalConstructor()
            ->setMethods(array('find_upload_with_field_name'))
            ->getMock();

        return $uploader;
    }

    private function addMethodFindUploadWithFieldName($uploader)
    {
        $uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('video_url'))
            ->will($this->returnValue(array(
                'saved_as' => $this->savedAsValue,
            )));

        return $uploader;
    }

    public function testProcess()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        Mock_S3::setForProcessExecutingCorrectly();
        Mock_File::setForProcessExecutingCorrectly();

        $videoUploader = $this->setUpVideoUploader($uploader);

        $actualResult = $videoUploader->process();

        $expectedResult = 'https://' . Config::get('s3.endpoint') . '/' . Upload_Storyboard::BUCKET . '/' . $this->savedAsValue;

        $this->assertEquals(
            $expectedResult,
            $actualResult,
            'Upload_Video::process() did not return expected URL'
        );
    }

    /**
     * @expectedException Upload_VideoNoFileException
     */
    public function testProcessThrowingUploaderException()
    {
        $uploader = $this->setUpMockUploader();

        $uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('video_url'))
            ->will($this->throwException(new UploaderException));

        $videoUploader = $this->setUpVideoUploader($uploader);

        $videoUploader->process();
    }

    /**
     * @expectedException Upload_VideoException
     */
    public function testProcessThrowingCloudStorageException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        Mock_S3::setForProcessThrowingExceptionOnPutObject();
        Mock_File::setForProcessExecutingCorrectly();

        $videoUploader = $this->setUpVideoUploader($uploader);

        $videoUploader->process();
    }

    /**
     * @expectedException Upload_VideoException
     */
    public function testProcessThrowingFileDeletionException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        Mock_S3::setForProcessExecutingCorrectly();
        Mock_File::setForProcessThrowingExceptionOnDelete();

        $videoUploader = $this->setUpVideoUploader($uploader);

        $videoUploader->process();
    }

    public function testRemove()
    {
        $uploader = $this->setUpMockUploader();

        Mock_S3::setForProcessExecutingCorrectly();
        Mock_File::setForProcessExecutingCorrectly();

        $videoUploader = $this->setUpVideoUploader($uploader);

        $videoUploader->remove('not a real URL');
    }

    /**
     * @expectedException Upload_VideoException
     */
    public function testRemoveThrowingException()
    {
        $uploader = $this->setUpMockUploader();

        Mock_S3::setForProcessThrowingExceptionOnDeleteObject();
        Mock_File::setForProcessExecutingCorrectly();

        $videoUploader = $this->setUpVideoUploader($uploader);

        $videoUploader->remove('not a real URL');

    }
}

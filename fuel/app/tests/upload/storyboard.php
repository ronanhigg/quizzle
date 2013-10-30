<?php

/**
 * @group App
 */
class Test_Upload_Storyboard extends TestCase
{
    public function setUp()
    {
        $this->savedAsValue = 'randomfilename';
    }

    private function setUpStoryboardUploader($uploader)
    {
        return new Upload_Storyboard($uploader, 'Mock_S3', 'Mock_File');
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
            ->with($this->equalTo('storyboard_url'))
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

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $actualResult = $storyboardUploader->process();

        $expectedResult = 'https://' . Config::get('s3.endpoint') . '/' . Upload_Storyboard::BUCKET . '/' . $this->savedAsValue;

        $this->assertEquals(
            $expectedResult,
            $actualResult,
            'Upload_Storyboard::process() did not return expected URL'
        );
    }

    /**
     * @expectedException Upload_StoryboardNoFileException
     */
    public function testProcessThrowingUploaderException()
    {
        $uploader = $this->setUpMockUploader();

        $uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('storyboard_url'))
            ->will($this->throwException(new UploaderException));

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->process();
    }

    /**
     * @expectedException Upload_StoryboardException
     */
    public function testProcessThrowingCloudStorageException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        Mock_S3::setForProcessThrowingExceptionOnPutObject();
        Mock_File::setForProcessExecutingCorrectly();

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->process();
    }

    /**
     * @expectedException Upload_StoryboardException
     */
    public function testProcessThrowingFileDeletionException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        Mock_S3::setForProcessExecutingCorrectly();
        Mock_File::setForProcessThrowingExceptionOnDelete();

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->process();
    }

    public function testRemove()
    {
        $uploader = $this->setUpMockUploader();

        Mock_S3::setForProcessExecutingCorrectly();
        Mock_File::setForProcessExecutingCorrectly();

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->remove('not a real URL');
    }

    /**
     * @expectedException Upload_StoryboardException
     */
    public function testRemoveThrowingException()
    {
        $uploader = $this->setUpMockUploader();

        Mock_S3::setForProcessThrowingExceptionOnDeleteObject();
        Mock_File::setForProcessExecutingCorrectly();

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->remove('not a real URL');

    }
}

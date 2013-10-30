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
        return new Upload_Storyboard($uploader, 'MockS3', 'MockFile');
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

    /**
     * @test
     */
    public function processReturnsStoryboardURL()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessExecutingCorrectly();

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
     * @test
     * @expectedException Upload_StoryboardNoFileException
     */
    public function processHandlesUploaderThrowingAnException()
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
     * @test
     * @expectedException Upload_StoryboardException
     */
    public function processHandlesCloudStorageServiceThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessThrowingExceptionOnPutObject();
        MockFile::setForProcessExecutingCorrectly();

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->process();
    }

    /**
     * @test
     * @expectedException Upload_StoryboardException
     */
    public function processHandlesFileUtilityThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessThrowingExceptionOnDelete();

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->process();
    }

    /**
     * @test
     */
    public function removeWorks()
    {
        $uploader = $this->setUpMockUploader();

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessExecutingCorrectly();

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->remove('not a real URL');
    }

    /**
     * @test
     * @expectedException Upload_StoryboardException
     */
    public function removeHandlesCloudStorageServiceThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();

        MockS3::setForProcessThrowingExceptionOnDeleteObject();
        MockFile::setForProcessExecutingCorrectly();

        $storyboardUploader = $this->setUpStoryboardUploader($uploader);

        $storyboardUploader->remove('not a real URL');

    }
}

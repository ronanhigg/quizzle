<?php

/**
 * @group App
 */
class Test_MediaStorer_Video extends TestCase
{
    public function setUp()
    {
        $this->savedAsValue = 'randomfilename';
    }

    private function setUpVideoStorer($uploader)
    {
        return new MediaStorer_Video($uploader, 'MockS3', 'MockFile');
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

    /**
     * @test
     */
    public function processReturnsVideoURL()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessExecutingCorrectly();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $actualResult = $videoStorer->process();

        $expectedResult = 'https://' . Config::get('s3.endpoint') . '/' . MediaStorer_Video::BUCKET . '/' . $this->savedAsValue;

        $this->assertEquals(
            $expectedResult,
            $actualResult,
            'MediaStorer_Video::process() did not return expected URL'
        );
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoNoFileException
     */
    public function processHandlesUploaderThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();

        $uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('video_url'))
            ->will($this->throwException(new UploaderException));

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->process();
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoException
     */
    public function processHandlesCloudStorageServiceThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessThrowingExceptionOnPutObject();
        MockFile::setForProcessExecutingCorrectly();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->process();
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoException
     */
    public function processHandlesFileUtilityThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessThrowingExceptionOnDelete();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->process();
    }

    /**
     * @test
     */
    public function removeWorks()
    {
        $uploader = $this->setUpMockUploader();

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessExecutingCorrectly();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->remove('not a real URL');
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoException
     */
    public function removeHandlesCloudStorageServiceThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();

        MockS3::setForProcessThrowingExceptionOnDeleteObject();
        MockFile::setForProcessExecutingCorrectly();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->remove('not a real URL');

    }
}

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
    public function storeReturnsVideoURL()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForStoreExecutingCorrectly();
        MockFile::setForStoreExecutingCorrectly();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $actualResult = $videoStorer->store();

        $expectedResult = 'https://' . Config::get('s3.endpoint') . '/' . MediaStorer_Video::BUCKET . '/' . $this->savedAsValue;

        $this->assertEquals(
            $expectedResult,
            $actualResult,
            'MediaStorer_Video::store() did not return expected URL'
        );
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoNoFileException
     */
    public function storeHandlesUploaderThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();

        $uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('video_url'))
            ->will($this->throwException(new UploaderException));

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->store();
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoException
     */
    public function storeHandlesCloudStorageServiceThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForStoreThrowingExceptionOnPutObject();
        MockFile::setForStoreExecutingCorrectly();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->store();
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoException
     */
    public function storeHandlesFileUtilityThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForStoreExecutingCorrectly();
        MockFile::setForStoreThrowingExceptionOnDelete();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->store();
    }

    /**
     * @test
     */
    public function removeWorks()
    {
        $uploader = $this->setUpMockUploader();

        MockS3::setForStoreExecutingCorrectly();
        MockFile::setForStoreExecutingCorrectly();

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

        MockS3::setForStoreThrowingExceptionOnDeleteObject();
        MockFile::setForStoreExecutingCorrectly();

        $videoStorer = $this->setUpVideoStorer($uploader);

        $videoStorer->remove('not a real URL');

    }
}

<?php

/**
 * @group App
 */
class Test_MediaStorer_Image extends TestCase
{
    public function setUp()
    {
        $this->savedAsValue = 'randomfilename';
    }

    private function setUpImageStorer($uploader)
    {
        return new MediaStorer_Image($uploader, 'MockS3', 'MockFile');
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
            ->with($this->equalTo('url_field_name'))
            ->will($this->returnValue(array(
                'saved_as' => $this->savedAsValue,
            )));

        return $uploader;
    }

    /**
     * @test
     */
    public function processReturnsImageURL()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessExecutingCorrectly();

        $imageStorer = $this->setUpImageStorer($uploader);

        $actualResult = $imageStorer->process('url_field_name');

        $expectedResult = 'https://' . Config::get('s3.endpoint') . '/' . MediaStorer_Image::BUCKET . '/' . $this->savedAsValue;

        $this->assertEquals(
            $expectedResult,
            $actualResult,
            'MediaStorer_Image::process() did not return expected URL'
        );
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageNoFileException
     */
    public function processHandlesUploaderThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();

        $uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('url_field_name'))
            ->will($this->throwException(new UploaderException));

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->process('url_field_name');
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageException
     */
    public function processHandlesCloudStorageServiceThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessThrowingExceptionOnPutObject();
        MockFile::setForProcessExecutingCorrectly();

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->process('url_field_name');
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageException
     */
    public function processHandlesFileUtilityThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessThrowingExceptionOnDelete();

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->process('url_field_name');
    }

    /**
     * @test
     */
    public function removeWorks()
    {
        $uploader = $this->setUpMockUploader();

        MockS3::setForProcessExecutingCorrectly();
        MockFile::setForProcessExecutingCorrectly();

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->remove('not a real URL');
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageException
     */
    public function removeHandlesCloudStorageServiceThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();

        MockS3::setForProcessThrowingExceptionOnDeleteObject();
        MockFile::setForProcessExecutingCorrectly();

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->remove('not a real URL');

    }
}

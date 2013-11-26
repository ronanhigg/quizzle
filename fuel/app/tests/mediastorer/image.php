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
        return new MediaStorer_Image($uploader);
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
    public function storeReturnsImageURL()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        $mockS3 = Mockery::mock('alias:S3');
        $mockS3
            ->shouldReceive('inputFile')
            ->once();
        $mockS3
            ->shouldReceive('putObject')
            ->once()
            ->andReturn(true);

        Mockery::mock('alias:File')
            ->shouldReceive('delete')
            ->once()
            ->andReturn(true);

        $imageStorer = $this->setUpImageStorer($uploader);

        $actualResult = $imageStorer->store('url_field_name');

        $expectedResult = 'https://' . Config::get('s3.endpoint') . '/' . MediaStorer_Image::BUCKET . '/' . $this->savedAsValue;

        $this->assertEquals(
            $expectedResult,
            $actualResult,
            'MediaStorer_Image::store() did not return expected URL'
        );
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageNoFileException
     */
    public function storeHandlesUploaderThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();

        $uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('url_field_name'))
            ->will($this->throwException(new UploaderException));

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->store('url_field_name');
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageException
     */
    public function storeHandlesCloudStorageServiceThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        $mockS3 = Mockery::mock('alias:S3');
        $mockS3
            ->shouldReceive('inputFile')
            ->once();
        $mockS3
            ->shouldReceive('putObject')
            ->once()
            ->andReturn(false);

        Mockery::mock('alias:File')
            ->shouldReceive('delete')
            ->once()
            ->andReturn(true);

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->store('url_field_name');
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageException
     */
    public function storeHandlesFileUtilityThrowingAnException()
    {
        $uploader = $this->setUpMockUploader();
        $uploader = $this->addMethodFindUploadWithFieldName($uploader);

        $mockS3 = Mockery::mock('alias:S3');
        $mockS3
            ->shouldReceive('inputFile')
            ->once();
        $mockS3
            ->shouldReceive('putObject')
            ->once()
            ->andReturn(true);

        Mockery::mock('alias:File')
            ->shouldReceive('delete')
            ->once()
            ->andReturn(false);

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->store('url_field_name');
    }

    /**
     * @test
     */
    public function removeWorks()
    {
        $uploader = $this->setUpMockUploader();

        Mockery::mock('alias:S3')
            ->shouldReceive('deleteObject')
            ->once()
            ->andReturn(true);

        Mockery::mock('alias:File')
            ->shouldReceive('delete')
            ->once()
            ->andReturn(true);

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

        Mockery::mock('alias:S3')
            ->shouldReceive('deleteObject')
            ->once()
            ->andReturn(false);

        Mockery::mock('alias:File')
            ->shouldReceive('delete')
            ->once()
            ->andReturn(true);

        $imageStorer = $this->setUpImageStorer($uploader);

        $imageStorer->remove('not a real URL');

    }
}

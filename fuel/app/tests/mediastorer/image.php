<?php

/**
 * @group FullApp
 * @group App
 */
class Test_MediaStorer_Image extends TestCase
{
    public function setUp()
    {
        $this->uploader = $this->setUpMockUploader();
        $this->cloudStorageAdapter = $this->setUpMockCloudStorageAdapter();
        $this->fileAdapter = $this->setUpMockFileAdapter();

        $this->imageStorer = new MediaStorer_Image($this->uploader, $this->cloudStorageAdapter, $this->fileAdapter);

        $this->savedAsValue = 'randomfilename';
    }

    private function setUpMockUploader()
    {
        $uploader = $this->getMockBuilder('Uploader')
            ->disableOriginalConstructor()
            ->setMethods(array('find_upload_with_field_name'))
            ->getMock();

        return $uploader;
    }

    private function setUpMockCloudStorageAdapter()
    {
        return Mockery::mock('Adapter_CloudStorage');
    }

    private function setUpMockFileAdapter()
    {
        return Mockery::mock('Adapter_File');
    }

    private function prepareMockUploaderForSuccessfulStore()
    {
        $this->uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('url_field_name'))
            ->will($this->returnValue(array(
                'saved_as' => $this->savedAsValue,
            )));
    }

    private function prepareMockCloudStorageAdapterForSuccessfulStore()
    {
        $this->cloudStorageAdapter
            ->shouldReceive('input_file')
            ->once();
        $this->cloudStorageAdapter
            ->shouldReceive('put_object')
            ->once()
            ->andReturn(true);
    }

    /**
     * @test
     */
    public function storeReturnsImageURL()
    {
        $this->prepareMockUploaderForSuccessfulStore();
        $this->prepareMockCloudStorageAdapterForSuccessfulStore();

        $this->fileAdapter
            ->shouldReceive('delete')
            ->once()
            ->andReturn(true);

        $actualResult = $this->imageStorer->store('url_field_name');

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
        $this->uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('url_field_name'))
            ->will($this->throwException(new UploaderException));

        $this->imageStorer->store('url_field_name');
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageException
     */
    public function storeHandlesCloudStorageServiceThrowingAnException()
    {
        $this->prepareMockUploaderForSuccessfulStore();

        $this->cloudStorageAdapter
            ->shouldReceive('input_file')
            ->once();
        $this->cloudStorageAdapter
            ->shouldReceive('put_object')
            ->once()
            ->andReturn(false);

        $this->imageStorer->store('url_field_name');
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageException
     */
    public function storeHandlesFileUtilityThrowingAnException()
    {
        $this->prepareMockUploaderForSuccessfulStore();
        $this->prepareMockCloudStorageAdapterForSuccessfulStore();

        $this->fileAdapter
            ->shouldReceive('delete')
            ->once()
            ->andReturn(false);

        $this->imageStorer->store('url_field_name');
    }

    /**
     * @test
     */
    public function removeWorks()
    {
        $this->cloudStorageAdapter
            ->shouldReceive('delete_object')
            ->once()
            ->andReturn(true);

        $this->imageStorer->remove('not a real URL');
    }

    /**
     * @test
     * @expectedException MediaStorer_ImageException
     */
    public function removeHandlesCloudStorageServiceThrowingAnException()
    {
        $this->cloudStorageAdapter
            ->shouldReceive('delete_object')
            ->once()
            ->andReturn(false);

        $this->imageStorer->remove('not a real URL');
    }
}

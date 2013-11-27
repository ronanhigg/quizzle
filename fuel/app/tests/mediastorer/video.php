<?php

/**
 * @group FullApp
 * @group App
 */
class Test_MediaStorer_Video extends TestCase
{
    public function setUp()
    {
        $this->uploader = $this->setUpMockUploader();
        $this->cloudStorageAdapter = $this->setUpMockCloudStorageAdapter();
        $this->fileAdapter = $this->setUpMockFileAdapter();

        $this->videoStorer = new MediaStorer_Video($this->uploader, $this->cloudStorageAdapter, $this->fileAdapter);

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
            ->with($this->equalTo('video_url'))
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

        $actualResult = $this->videoStorer->store();

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
        $this->uploader->expects($this->once())
            ->method('find_upload_with_field_name')
            ->with($this->equalTo('video_url'))
            ->will($this->throwException(new UploaderException));

        $this->videoStorer->store();
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoException
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

        $this->videoStorer->store();
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoException
     */
    public function storeHandlesFileUtilityThrowingAnException()
    {
        $this->prepareMockUploaderForSuccessfulStore();
        $this->prepareMockCloudStorageAdapterForSuccessfulStore();

        $this->fileAdapter
            ->shouldReceive('delete')
            ->once()
            ->andReturn(false);

        $this->videoStorer->store();
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

        $this->videoStorer->remove('not a real URL');
    }

    /**
     * @test
     * @expectedException MediaStorer_VideoException
     */
    public function removeHandlesCloudStorageServiceThrowingAnException()
    {
        $this->cloudStorageAdapter
            ->shouldReceive('delete_object')
            ->once()
            ->andReturn(false);

        $this->videoStorer->remove('not a real URL');
    }
}


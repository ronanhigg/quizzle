<?php

/**
 * @group FullApp
 * @group Adapters
 */
class Test_Adapter_CloudStorage extends TestCase
{
    public function setUp()
    {
        $this->cloudStorageAdapter = new Adapter_CloudStorage;
    }

    public function tearDown()
    {
        Mockery::close();
    }

    /**
     * @test
     */
    public function inputFileReturnsResultOfInputFileFromAdaptee()
    {
        $fixtures = array(
            array(
                'file' => '/a/file/path',
                'md5sum' => true,
                'result' => array(
                    'params' => 'that',
                    'we' => 'do',
                    'not' => 'care',
                    'about' => '.',
                ),
            ),
            array(
                'file' => '/a/file/that/does/not/exist',
                'md5sum' => true,
                'result' => false,
            ),
        );

        $mock = Mockery::mock('alias:S3');

        foreach ($fixtures as $fixture) {

            $mock->shouldReceive('inputFile')
                ->with($fixture['file'], $fixture['md5sum'])
                ->andReturn($fixture['result']);

            $actualResult = $this->cloudStorageAdapter->input_file($fixture['file'], $fixture['md5sum']);

            $this->assertEquals(
                $fixture['result'],
                $actualResult,
                'Adapter_CloudStorage::input_file() did not return expected result for input file "' . $fixture['file'] . '"'
            );
        }
    }

    /**
     * @test
     */
    public function putObjectReturnsResultOfPutObjectFromAdaptee()
    {
        $fixtures = array(
            array(
                'input' => array(
                    'some' => 'file',
                    'info' => 'input',
                ),
                'bucket' => 'a-bucket-name',
                'uri' => 'file-name-of-put-object.jpeg',
                'result' => true,
            ),
            array(
                'input' => array(
                    'some' => 'bad',
                    'file' => 'input',
                ),
                'bucket' => 'a-bad-bucket-name',
                'uri' => 'bad-file-name-of-put-object.mov',
                'result' => false,
            ),
        );

        $mock = Mockery::mock('alias:S3');

        foreach ($fixtures as $fixture) {

            $mock->shouldReceive('putObject')
                ->with($fixture['input'], $fixture['bucket'], $fixture['uri'])
                ->andReturn($fixture['result']);

            $actualResult = $this->cloudStorageAdapter->put_object($fixture['input'], $fixture['bucket'], $fixture['uri']);

            $this->assertEquals(
                $fixture['result'],
                $actualResult,
                'Adapter_CloudStorage::put_object() did not return expected result for URI "' . $fixture['uri'] . '"'
            );
        }
    }

    /**
     * @test
     */
    public function deleteObjectReturnsResultOfDeleteObjectFromAdaptee()
    {
        $fixtures = array(
            array(
                'bucket' => 'a-bucket-name',
                'uri' => 'file-name-of-put-object.jpeg',
                'result' => true,
            ),
            array(
                'bucket' => 'a-bad-bucket-name',
                'uri' => 'bad-file-name-of-put-object.avi',
                'result' => false,
            ),
        );

        $mock = Mockery::mock('alias:S3');

        foreach ($fixtures as $fixture) {

            $mock->shouldReceive('deleteObject')
                ->with($fixture['bucket'], $fixture['uri'])
                ->andReturn($fixture['result']);

            $actualResult = $this->cloudStorageAdapter->delete_object($fixture['bucket'], $fixture['uri']);

            $this->assertEquals(
                $fixture['result'],
                $actualResult,
                'Adapter_CloudStorage::delete_object() did not return expected result for URI "' . $fixture['uri'] . '"'
            );
        }
    }
}

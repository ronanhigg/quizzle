<?php

/**
 * @group FullApp
 * @group Adapters
 */
class Test_Adapter_File extends TestCase
{
    public function setUp()
    {
        $this->fileAdapter = new Adapter_File;
    }

    public function tearDown()
    {
        Mockery::close();
    }

    /**
     * @test
     */
    public function deleteReturnsResultOfDeleteFromAdaptee()
    {
        $fixtures = array(
            array(
                'path' => '/file/deleted/successfully',
                'result' => true,
            ),
            array(
                'path' => '/file/not/deleted/well',
                'result' => false,
            ),
        );

        $mock = Mockery::mock('alias:File');

        foreach ($fixtures as $fixture) {

            $mock->shouldReceive('delete')
                ->with($fixture['path'])
                ->andReturn($fixture['result']);

            $actualResult = $this->fileAdapter->delete($fixture['path']);

            $this->assertEquals(
                $fixture['result'],
                $actualResult,
                'Adapter_File::delete() did not return ' . $fixture['result'] . ' as expected'
            );
        }
    }
}
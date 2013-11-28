<?php

class Mock_Model_ModelName
{
    public static $kinvey_name;

    public function __construct($params)
    {
        foreach ($params as $key => $value) {
            if ($key === '_id') {
                $this->id = $value;
            } else if (substr($key, 0, 1) !== '_') {
                $this->{$key} = $value;
            }
        }
    }
}

/**
 * @group FullApp
 * @group App
 */
class Test_Collection extends TestCase
{
    public function setUp()
    {
        $this->collection = Mockery::mock('Collection')->makePartial();

        Collection::$model_class = 'Mock_Model_ModelName';
    }

    public function tearDown()
    {
        Mockery::close();
    }

    private function setUpMockCurlRequest()
    {
        $curlRequest = Mockery::mock('Request_Curl');

        $curlRequest
            ->shouldReceive('set_method')
            ->once()
            ->with('GET');

        $curlRequest
            ->shouldReceive('http_login')
            ->once()
            ->with(Config::get('kinvey.username'), Config::get('kinvey.password'));

        return $curlRequest;   
    }

    private function setUpResponseFromMockCurlRequest($curlRequest, $responseBody)
    {
        $curlRequest
            ->shouldReceive('execute')
            ->once();

        $curlRequest
            ->shouldReceive('response')
            ->once()
            ->andReturn((object) array(
                'body' => json_encode($responseBody)
            ));

        Mockery::mock('alias:Request')
            ->shouldReceive('forge')
            ->once()
            ->andReturn($curlRequest);
    }

    private function assertFetchMethodExecutedCorrectly($expectedResponseData, $fetchMethod)
    {
        $this->assertTrue(
            $this->collection->has_models(),
            'Collection::' . $fetchMethod . '() did not fetch models for Collection::has_models() to verify'
        );

        foreach ($this->collection as $actualModel) {

            $this->assertInstanceOf(
                'Mock_Model_ModelName',
                $actualModel,
                'Collection::' . $fetchMethod . '() did not fetch a model with the correct type'
            );

            $this->assertEquals(
                $expectedResponseData[$actualModel->id]['name'],
                $actualModel->name,
                'Collection::' . $fetchMethod . '() did not fetch the correct name for the model with ID ' . $actualModel->id
            );
        }
    }

    /**
     * @test
     */
    public function fetchAllSetsModelsForTheCollection()
    {
        $expectedResponseData = array(
            1 => array(
                '_id' => 1,
                'name' => 'Mock Model 1',
            ),
            2 => array(
                '_id' => 2,
                'name' => 'Mock Model 2',
            ),
            3 => array(
                '_id' => 3,
                'name' => 'Mock Model 3',
            ),
            4 => array(
                '_id' => 4,
                'name' => 'Model of Boba Fett',
            ),
        );

        $curlRequest = $this->setUpMockCurlRequest();
        $this->setUpResponseFromMockCurlRequest($curlRequest, array_values($expectedResponseData));

        $this->collection->fetch_all();

        $this->assertFetchMethodExecutedCorrectly($expectedResponseData, 'fetch_all');
    }

    /**
     * @test
     */
    public function fetchWhereSetsSomeModelsForTheCollection()
    {
        $expectedResponseData = array(
            1 => array(
                '_id' => 1,
                'name' => 'Mock Model 1',
            ),
        );

        $curlRequest = $this->setUpMockCurlRequest();
        $this->setUpResponseFromMockCurlRequest($curlRequest, array_values($expectedResponseData));

        $this->collection->fetch_where(array(
            'name' => 'Mock Model 1',
        ));

        $this->assertFetchMethodExecutedCorrectly($expectedResponseData, 'fetch_where');
    }

    /**
     * @test
     */
    public function fetchLimitedSetsSomeModelsForTheCollection()
    {
        $expectedResponseData = array(
            2 => array(
                '_id' => 2,
                'name' => 'Mock Model 2',
            ),
            3 => array(
                '_id' => 3,
                'name' => 'Mock Model 3',
            ),
        );

        $curlRequest = $this->setUpMockCurlRequest();
        $this->setUpResponseFromMockCurlRequest($curlRequest, array_values($expectedResponseData));

        $this->collection->fetch_limited(2, 1);

        $this->assertFetchMethodExecutedCorrectly($expectedResponseData, 'fetch_limited');
    }
}

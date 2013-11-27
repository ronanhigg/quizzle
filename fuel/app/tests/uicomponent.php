<?php

/**
 * @group FullApp
 * @group App
 */
class Test_UIComponent extends TestCase
{
    public function tearDown()
    {
        Mockery::close();
    }

    /**
     * @test
     */
    public function renderReturnsViewAsString()
    {
        $uicomponent = new UIComponent;

        $expected_rendered_uicomponent = 'Rendered View';

        Mockery::mock('alias:View')
            ->shouldReceive('forge')
            ->once()
            ->with(null, array(
                'template' => null
            ))
            ->andReturn($expected_rendered_uicomponent);

        $actual_rendered_uicomponent = $uicomponent->render();

        $this->assertEquals(
            $expected_rendered_uicomponent,
            $actual_rendered_uicomponent,
            'UIComponent::render() did not return the expected string'
        );
    }
}

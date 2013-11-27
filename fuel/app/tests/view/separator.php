<?php

/**
 * @group FullApp
 * @group App
 */
class Test_View_Separator extends TestCase
{
    public function tearDown()
    {
        Mockery::close();
    }

    /**
     * @test
     */
    public function renderReturnsTemplate()
    {
        $separator = new View_Separator;

        $expected_template_path = 'components/separator';

        Mockery::mock('alias:View')
            ->shouldReceive('forge')
            ->once()
            ->with($expected_template_path, array(
                'template' => $expected_template_path
            ))
            ->andReturn('<hr>');

        $actual_rendered_separator = $separator->render();

        $this->assertEquals(
            '<hr>',
            $actual_rendered_separator,
            'View_Separator::render() did not return the expected template'
        );
    }
}

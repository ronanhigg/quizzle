<?php

class Controller_Navigation extends Controller_Base
{
	public function action_dashboard()
	{
		$this->template->title = 'Quizzle Operator Dashboard';
		$this->template->content = View::forge('navigation/dashboard');
	}

	public function action_404()
	{
		$this->template->title = 'Page Not Found';
		$this->template->content = View::forge('navigation/404');
	}
}

<?php

class Controller_Base extends Controller_Template
{
    public $template = 'template';

    public function before()
    {
        parent::before();

        /*if ( ! Auth::member(100) and ! $this->is_login_action()) {
            Response::redirect('admin/login');
        }

        $this->current_user = Model_User::query()
            ->where('email', Auth::get_screen_name())
            ->get_one();

        $this->template->set_global('current_user', $this->current_user);
        $this->template->set_global('is_logged_in', Auth::check());*/
        $this->template->set_global('is_logged_in', true);
        $this->template->set_global('appname', 'Quizzle');

        $this->template->navigation = View_Navigation::find_all(Request::active());
    }

    public function after($response)
    {
        $response = parent::after($response);

        if ( ! isset($this->template->primary_actions)) {
            $this->template->primary_actions = array();
        }

        return $response;
    }

    /*private function is_login_action()
    {
        $request = Request::active();
        return $request->controller = 'Controller_Admin_Auth' && $request->action == 'login';
    }*/
}

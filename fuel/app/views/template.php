<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

        <?=Casset::render_css('main')?>
        <?=Casset::render_js('modernizr')?>

    </head>
    <body>
        <!--[if lt IE 7]>
            <p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
        <![endif]-->

    <?php if ($is_logged_in) : ?>

        <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
            <div class="container">

                <div class="navbar-header">

                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-primary-collapse">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>

                    <a class="navbar-brand" href="/"><?=$appname?></a>

                </div>

                <div class="collapse navbar-collapse navbar-primary-collapse">

                    <ul class="nav navbar-nav">
                        <?php foreach ($navigation as $el) : ?>
                            <li class="<?=$el->li_classes?>">
                                <a href="<?=$el->route?>"><?=$el->label?></a>
                            </li>
                        <?php endforeach ?>
                    </ul>

                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Username <b class="caret"></b></a>
                            <ul class="dropdown-menu">
                                <li><a href="/admin/logout">Log Out</a></li>
                            </ul>
                        </li>
                    </ul>

                </div>

            </div>
        </nav>

    <?php endif ?>

        <div class="container">

        <div class="page-header">

            <div class="pull-right">
                <?php foreach ($primary_actions as $component) : ?>
                    <?=$component->render()?>
                <?php endforeach ?>
            </div>

            <h2><?=$title?></h2>

        </div>

        <?php if (Session::get_flash('error')) : ?>
            <div class="alert alert-danger"><?=Session::get_flash('error')?></div>
        <?php endif ?>

        <?php if (Session::get_flash('success')) : ?>
            <div class="alert alert-success"><?=Session::get_flash('success')?></div>
        <?php endif ?>

        <?php if (Session::get_flash('message')) : ?>
            <div class="alert alert-info"><?=Session::get_flash('message')?></div>
        <?php endif ?>

                <?=$content?>

        <?php if ($is_logged_in) : ?>

            <hr>

            <footer>

                <?=$appname?> Operator Dashboard is running in the <em><?=Fuel::$env?></em> environment.

            </footer>

        <?php endif ?>

    </div>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="/assets/js/vendor/jquery.js"><\/script>')</script>

    <script data-main="/assets/js/init" src="/assets/js/vendor/require.js"></script>

    <?=Casset::render_js('main')?>

    </body>
</html>

<form method="POST" class="form-horizontal" role="form" enctype="multipart/form-data" id="ads-form">

  <?php foreach ($components as $component) : ?>
    <?=$component->render()?>
  <?php endforeach ?>

  <hr>

  <?php foreach ($bonus_quizzes as $bonus_quiz_components) : ?>
    <div class="js-view" data-name="bonus-quiz">
      <?php foreach ($bonus_quiz_components as $component) : ?>
        <?=$component->render()?>
      <?php endforeach ?>
    </div>
  <?php endforeach ?>

  <div class="js-view-holder" data-view-holder="bonus-quiz">
  </div>

  <div class="form-group">
    <div class="col-lg-offset-2 col-lg-10">
      <button type="button" class="btn btn-default btn-sm js-load-view" data-view-template="bonus-quiz" data-view-target="bonus-quiz" data-focus-target="question[]">Add a Bonus Quiz question for this Ad</button>
    </div>
  </div>

  <script type="text/html" class="js-view-template" data-name="bonus-quiz">
    <div class="js-view" data-name="bonus-quiz">
      <?php foreach ($template_bonus_quiz_components as $component) : ?>
        <?=$component->render()?>
      <?php endforeach ?>
    </div>
  </script>

  <hr>

  <div class="form-group">
    <div class="col-lg-offset-2 col-lg-10">
      <button type="submit" class="btn btn-default btn-lg">Save Ad</button>
    </div>
  </div>

</form>
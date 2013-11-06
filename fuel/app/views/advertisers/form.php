<form method="POST" class="form-horizontal" role="form" enctype="multipart/form-data" id="advertisers-form">

  <?php foreach ($components as $component) : ?>
    <?=$component->render()?>
  <?php endforeach ?>

  <hr>

  <?php foreach ($loaded_quizzes as $quiz_components) : ?>
    <div class="js-view" data-name="quiz">
      <?php foreach ($quiz_components as $component) : ?>
        <?=$component->render()?>
      <?php endforeach ?>
    </div>
  <?php endforeach ?>

  <div class="js-view-holder" data-view-holder="quiz">
  </div>

  <div class="form-group">
    <div class="col-lg-offset-2 col-lg-10">
      <button type="button" class="btn btn-default btn-sm js-load-view" data-view-template="quiz" data-view-target="quiz" data-focus-target="question[]">Add a Quiz question for this Advertiser</button>
    </div>
  </div>

  <script type="text/html" class="js-view-template" data-name="quiz">
    <div class="js-view" data-name="quiz">
      <?php foreach ($template_quiz_components as $component) : ?>
        <?=$component->render()?>
      <?php endforeach ?>
    </div>
  </script>

  <hr>

  <div class="form-group">
    <div class="col-lg-offset-2 col-lg-10">
      <button type="submit" class="btn btn-default btn-lg">Save Advertiser</button>
    </div>
  </div>

</form>
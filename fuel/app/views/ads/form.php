<form method="POST" class="form-horizontal" role="form" enctype="multipart/form-data" id="ads-form">

  <?php foreach ($components as $component) : ?>
    <?=$component->render()?>
  <?php endforeach ?>

  <hr>

  <div class="form-group">
    <div class="col-lg-offset-2 col-lg-10">
      <button type="button" class="btn btn-default btn-sm">Add a Bonus Quiz question for this Ad</button>
    </div>
  </div>

  <hr>

  <div class="form-group">
    <div class="col-lg-offset-2 col-lg-10">
      <button type="submit" class="btn btn-default btn-lg">Save Ad</button>
    </div>
  </div>

</form>
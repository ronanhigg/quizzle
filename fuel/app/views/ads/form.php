<form method="POST" class="form-horizontal" role="form" enctype="multipart/form-data" id="ads-form">

  <?php foreach ($components as $component) : ?>
    <?=$component->render()?>
  <?php endforeach ?>

  <div class="form-group">
    <div class="col-lg-offset-2 col-lg-10">
      <button type="submit" class="btn btn-default">Save Ad</button>
    </div>
  </div>

</form>
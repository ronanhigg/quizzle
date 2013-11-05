<a
  href="<?=$href?>"
  class="btn btn-default btn-sm <?=$additional_classes?>"
  <?php foreach ($data_attributes as $attribute => $value) : ?>
      data-<?=$attribute?>="<?=$value?>"
  <?php endforeach ?>
  >
  <?=$label?>
</a>
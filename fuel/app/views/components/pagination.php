<ul class="pagination">
  <?php foreach ($page_links as $page_link) : ?>
    <?=$page_link->render()?>
  <?php endforeach ?>
</ul>
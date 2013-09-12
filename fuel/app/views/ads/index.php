<?php if ($no_ads) : ?>
  <div class="alert alert-info">
    There are currently no ads in the system to display.
  </div>
<?php else : ?>

  <table class="table table-striped">

    <thead>
      <tr>
        <th>ID</th>
        <th>Ad Detection Identifier</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      <?php foreach ($ads as $ad) : ?>
        <tr>
          <td><?=$ad->id?></td>
          <td><?=$ad->ad_detection_identifier?></td>
          <td style="text-align: right;">
            <a href="ads/update/<?=$ad->id?>" class="btn btn-default btn-xs">Edit</a>
            <a href="ads/delete/<?=$ad->id?>" class="btn btn-default btn-xs">Delete</a>
          </td>
        </tr>
      <?php endforeach ?>
    </tbody>

  </table>

<?php endif ?>
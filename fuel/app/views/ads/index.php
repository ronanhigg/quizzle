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
        <th>Ad Title</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      <?php foreach ($ads as $ad) : ?>
        <tr>
          <td><?=$ad->id?></td>
          <td><?=$ad->ad_detection_identifier?></td>
          <td><?=$ad->title?></td>
          <td style="text-align: right;">
            <a href="/ads/update/<?=$ad->id?>" class="btn btn-default btn-xs">Edit</a>
            <a href="#" class="btn btn-default btn-xs js-delete" data-id="<?=$ad->id?>">Delete</a>
          </td>
        </tr>
      <?php endforeach ?>
    </tbody>

  </table>

  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          <h4 class="modal-title">Delete Ad</h4>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this ad?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
          <a href="#" data-base-url="/ads/delete/" class="btn btn-danger" id="delete-modal-submit">Delete Ad</a>
        </div>
      </div>
    </div>
  </div>

<?php endif ?>
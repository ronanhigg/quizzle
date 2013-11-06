<?php if ($no_advertisers) : ?>
  <div class="alert alert-info">
    There are currently no advertisers in the system to display.
  </div>
<?php else : ?>

  <table class="table table-striped">

    <thead>
      <tr>
        <th>ID</th>
        <th>Advertiser Name</th>
        <th># Quizzes</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      <?php foreach ($advertisers as $advertiser) : ?>
        <tr>
          <td><?=$advertiser->id?></td>
          <td><?=$advertiser->name?></td>
          <td>-</td>
          <td style="text-align: right;">
            <a href="/advertisers/update/<?=$advertiser->id?>" class="btn btn-default btn-xs">Edit</a>
            <a href="#" class="btn btn-default btn-xs js-delete" data-id="<?=$advertiser->id?>">Delete</a>
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
          <h4 class="modal-title">Delete Advertiser</h4>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this advertiser and all associated ads and quizzes?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
          <a href="#" data-base-url="/advertisers/delete/" class="btn btn-danger" id="delete-modal-submit">Delete Advertiser</a>
        </div>
      </div>
    </div>
  </div>

<?php endif ?>
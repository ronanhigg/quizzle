<form method="POST" class="form-horizontal" role="form">

  <div class="form-group">
    <label for="ad_detection_identifier" class="col-lg-2 control-label">
      Ad Detection Identifier
    </label>
    <div class="col-lg-10">
      <input type="text" class="form-control" id="ad_detection_identifier" name="ad_detection_identifier" value="<?=Input::post('ad_detection_identifier', isset($ad) ? $ad->ad_detection_identifier : '')?>">
    </div>
  </div>

  <div class="form-group">
    <div class="col-lg-offset-2 col-lg-10">
      <button type="submit" class="btn btn-default">Save Ad</button>
    </div>
  </div>

</form>
<div class="input-group">
  <span class="input-group-addon">
    <span class="glyphicon glyphicon-calendar"></span>
  </span>
  <input type="text" class="form-control js-date" data-date="<?=$date?>" data-date-format="dd-mm-yyyy" id="<?=$key?>" name="<?=$key?>" value="<?=Input::post($key, $value)?>">
</div>
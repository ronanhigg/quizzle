function onRequest(request, response, modules){
  var collectionAccess = modules.collectionAccess,
      entity = modules.utils.kinveyEntity;
    
  response.body = {
    airingsFinished: {
      count: 0,
      airings: []
    },
    airingsStarted: {
      count: 0,
      airings: []
    }
  };
  
  collectionAccess.collection('airings').find({
    is_currently_on: true
  }, function (err, docs) {
    var airing,
        now = Math.round(new Date().getTime() / 1000);
    if (err) {
      logger.error('Could not find airing ' + err);
    } else {
      while (docs.length > 0) {
        airing = docs.pop();
        if (now >= airing.finishing_at) {
          airing.is_currently_on = false;
          collectionAccess.collection('airings').save(airing);
          response.body.airingsFinished.count++;
          response.body.airingsFinished.airings.push(airing);
        }
      }
    }
  });
  
  var now = Math.round(new Date().getTime() / 1000);
  
  response.body.now = now;
  
  collectionAccess.collection('airings').find({
    is_currently_on: false,
    starting_at: {"$lt": now},
    finishing_at: {"$gt": now}
  }, function (err, docs) {
    response.body.foundSomeAirings = true;
    if (err) {
      logger.error('Could not find airing ' + err);
    } else {
      while (docs.length > 0) {
        airing = docs.pop();
        airing.is_currently_on = true;
        response.body.airingsStarted.count++;
        response.body.airingsStarted.airings.push(airing);
        collectionAccess.collection('airings').save(airing);
      }
    }
  });
  
  response.complete(200);
}
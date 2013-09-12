function onRequest(request, response, modules){
  var collectionAccess = modules.collectionAccess,
      entity = modules.utils.kinveyEntity,
      airing = {
        channel: request.body.channel,
        show: request.body.show,
        starting_at: request.body.starting_at,
        finishing_at: request.body.finishing_at,
        is_currently_on: false
      };
  
  collectionAccess.collection('channels').find({
    "epg_identifier": request.body.channel
  }, function (err, docs) {
    if (err) {
      logger.error('Could not find channel ' + request.body.channel + '. ' + err);
    } else {
      channel = docs.pop();
      airing.channel = {
        _type: "KinveyRef",
        _collection: "channels",
        _id: channel._id
      };
      
      collectionAccess.collection('shows').find({
        "name": request.body.show
      }, function (err, docs) {
        if (err) {
          logger.error('Error finding show: ' + err);
        } else {
          
          // Show exists
          if (docs.length > 0) {
            show = docs.pop();
          
          // Show must be created
          } else {
            show = entity({
              name: request.body.show,
              threshold_for_ad_break_to_be_deemed_finished: 10
            });
            collectionAccess.collection('shows').save(show);
          }
          
          airing.show = {
            _type: "KinveyRef",
            _collection: "shows",
            _id: show._id
          };
          
          collectionAccess.collection('airings').find({
            channel: airing.channel,
            starting_at: airing.starting_at,
            finishing_at: airing.finishing_at
          }, function (err, docs) {
            if (err) {
              logger.error('Error finding airing: ' + err);
            } else {
              // Airing exists for this time on this channel
              if (docs.length > 0) {
                
                airing = docs.pop();
                
                response.body = {
                  message: "Airing already exists on this channel at this time",
                  airing: airing
                };
                response.complete(200);
                return;
                
              // No airing exists
              } else {
                
                airing = entity(airing);
                
                collectionAccess.collection('airings').save(airing);
                
                response.body = {
                  message: "Airing added successfully",
                  airing: airing
                };
                response.complete(200);
                return;
              }
            }
          });
        }
      });
    }
  });
}
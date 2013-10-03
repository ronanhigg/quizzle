function onRequest(request, response, modules) {
  var i, parseAiring, counter,

      collectionAccess = modules.collectionAccess,
      entity = modules.utils.kinveyEntity,
      logger = modules.logger,

      airingsCollection = collectionAccess.collection('airings'),
      channelsCollection = collectionAccess.collection('channels'),
      showsCollection = collectionAccess.collection('shows'),

      airings = request.body.airings;

  response.body = {
    results: []
  };

  counter = 0;
  logger.info('Starting: ' + counter);

  parseAiring = function (airingData) {

    var airing;

    logger.info('Call parseAiring: ' + counter + '. Airing Data is ' + airingData);

    if (airingData === undefined) {
      response.complete(200);
      return;
    }

    logger.info('Checked if airingData is undefined. (' + counter + ')');

    airing = {
      channel: airingData.channel,
      show: airingData.show,
      starting_at: airingData.starting_at,
      finishing_at: airingData.finishing_at,
      is_currently_on: false
    };

    logger.info('Created airing object. (' + counter + ')');
    logger.info('The channels collection is ' + channelsCollection + '. (' + counter + ')');

    channelsCollection.find({
      "epg_identifier": airingData.channel
    }, function (err, docs) {
      logger.info('This test function ran. (' + counter + ')');
    });

    logger.info('Find "worked" on the channels collection. (' + counter + ')');
  
    channelsCollection.find({
      "epg_identifier": airingData.channel
    }, function (err, docs) {
      logger.info('Access channels collection: ' + counter);

      if (err) {
        logger.error('Could not find channel ' + airingData.channel + '. ' + err);
      } else {
        channel = docs.pop();

        airing.channel = {
          _type: "KinveyRef",
          _collection: "channels",
          _id: channel._id
        };
        
        showsCollection.find({
          "name": airingData.show
        }, function (err, docs) {
          logger.info('Access shows collection: ' + counter);

          if (err) {
            logger.error('Error finding show: ' + err);
          } else {
            
            // Show exists
            if (docs.length > 0) {
              show = docs.pop();
            
            // Show must be created
            } else {
              show = entity({
                name: airingData.show,
                threshold_for_ad_break_to_be_deemed_finished: 10
              });
              collectionAccess.collection('shows').save(show);
            }
            
            airing.show = {
              _type: "KinveyRef",
              _collection: "shows",
              _id: show._id
            };
            
            airingsCollection.find({
              channel: airing.channel,
              starting_at: airing.starting_at,
              finishing_at: airing.finishing_at
            }, function (err, docs) {
              logger.info('Access airings collection: ' + counter);

              if (err) {
                logger.error('Error finding airing: ' + err);
              } else {
                // Airing exists for this time on this channel
                if (docs.length > 0) {
                  
                  airing = docs.pop();
                  
                  response.body.results.push({
                    message: "Airing already exists on this channel at this time",
                    airing: airing
                  });
                  
                // No airing exists
                } else {
                  
                  airing = entity(airing);
                  
                  collectionAccess.collection('airings').save(airing);
                  
                  response.body.results.push({
                    message: "Airing added successfully",
                    airing: airing
                  });
                }

                logger.info('Got to end: ' + counter);
                logger.info(airing);
                counter++;
                parseAiring(airings.pop());
              }
            });
          }
        });
      }
    });

  };

  parseAiring(airings.pop());
}
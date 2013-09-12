function onPostSave(request, response, modules) {
  var ad, adBreak, airing,
      
      adDetection = request.body,
      
      adsCollection = modules.collectionAccess.collection('ads'),
      adBreaksCollection = modules.collectionAccess.collection('adBreaks'),
      airingsCollection = modules.collectionAccess.collection('airings'),
      channelsCollection = modules.collectionAccess.collection('channels'),
      
      logger = modules.logger,
      createEntity = modules.utils.kinveyEntity;
  
  logger.info('Post Save for adDetections has been called.');
  
  adsCollection.find({
    'ad_detection_identifier': adDetection.ad_identifier
  }, function (err, docs) {
    if (err) {
      return response.error('Could not find ad for "' + adDetection.ad_identifier + '".');
    }
    
    if (docs.length < 1) {
      response.body = {
        'message': 'No ad exists in the system with the detection ID "' + adDetection.ad_identifier + '".'
      };
      logger.info('No ad exists in the system with the detection ID "' + adDetection.ad_identifier + '".');
      return response.continue();
    }
    
    ad = docs.pop();
    
    channelsCollection.find({
      'ad_detection_identifier': adDetection.channel_identifier
    }, function (err, docs) {
      if (err) {
        return response.error('Could not find channel for "' + adDetection.channel_identifier + '".');
      }
      
      airingsCollection.find({
        'channel._id': docs.pop()._id,
        'is_currently_airing': true
      }, function (err, docs) {
        if (err) {
          return response.error('Could not find airing for channel "' + adDetection.channel_identifier + '".');
        }
        
        airing = docs.pop();
        
        adBreak = createEntity({
          'airing': {
            '_type': 'KinveyRef',
            '_collection': 'airings',
            '_id': airing._id
          },
          is_currently_on: true
        });
        
        adBreaksCollection.save(adBreak, function (err, doc) {
          if (err) {
            return response.error('An error occurred when trying to create the adBreak.');
          }
          
          response.body = {
            'message': 'New adBreak created with ID "' + adBreak._id + '".',
            'adBreak': adBreak
          };
          logger.info('New adBreak created with ID "' + adBreak._id + '".');
          return response.continue();
        });
        
      });
    });
    
  });
  

  
  
    /*var errorMessage,
      setupAdBreakCron,
      updateAdBreakCron,
      adDetection = request.body,
      adsCollection = modules.collectionAccess.collection('ads'),
      adBreaksCollection = modules.collectionAccess.collection('adBreaks'),
      airingsCollection = modules.collectionAccess.collection('airings'),
      channelsCollection = modules.collectionAccess.collection('channels');

  channelsCollection.find({
    'ad_detection_identifier': adDetection.channel_identifier
  })
    .then(function (err, docs) {
      if (err) {
        errorMessage = 'Could not find channel ' + adDetection.channel_identifier;
        modules.logger.error(errorMessage);
        return response.error(errorMessage);
      }
      
      channel = docs.pop();
      airingsCollection.find({
        'channel': channel,
        'is_currently_on': true
      })
        .then(function (err, docs) {
          if (err) {
            errorMessage = 'Could not find airing for channel ' + adDetection.channel_identifier;
            modules.logger.error(errorMessage);
            return response.error(errorMessage);
          }
          
          airing = docs.pop();
          adBreaksCollection.find({
            'airing': airing,
            'is_currently_on': true
          })
            .then(function (err, docs) {
              if (err) {
                        errorMessage = 'Could not find ad break for channel ' + adDetection.channel_identifier;
                modules.logger.error(errorMessage);
                return response.error(errorMessage);
              }
              
              if (docs.length < 0) {
                adBreak = {
                  'airing': {
                    '_type': 'KinveyRef',
                    '_collection': 'airings',
                    '_id': airing.id
                  },
                  'is_currently_on': true
                };
              } else {
                adBreak = docs.pop();
              }
              
              adBreaksCollection.save(adBreak);
            });
        });
      
    });*/
  
  /*
  adsCollection.find({
    'ad_detection_identifier': adDetection.ad_identifier
  })
    .then(function(err, docs) {
      if (docs.length < 1) {
        modules.logger.info('No ad exists for identifier "' + adDetection.ad_identifier + '".');
        return response.continue();
        
      } else {
        ad = docs.pop();
        
      }
    });
  */
}
/*                                                                            */
function onRequest(request, response, modules) {
  
  /* NOTE - This endpoint is only called by the iPharro system, which does not
            require any response. The commented out code below can be used for
            debugging purposes.
            -- Conor
  */
  
  var logger = modules.logger,

      init,
      createRelation,
      createAdDetection,
      getAdAndAdBreak,
      createNewCron,
      updateCron;
  
  init = function () {
    createAdDetection();
  };
  
  createRelation = function (collection, id) {
    return {
      _type: "KinveyRef",
      _collection: collection,
      _id: id,
    };
  };
  
  createAdDetection = function () {
    var adDetection,
        requestData = request.body,
        adDetectionsCollection = modules.collectionAccess.collection('adDetections'),
        createEntity = modules.utils.kinveyEntity;
    
    if (requestData.type !== 'start') {
      /**/
      response.body = {
        'messages': ['No adDetection created as this request has type "' + requestData.type + '".']
      };
      /**/
      return response.complete(200);
    }
    
    adDetection = createEntity({
      ad_detection_id: requestData.detid,
      ad_identifier: requestData.id,
      broadcast_finishing_at: requestData.broadcast_end_time,
      broadcast_starting_at: requestData.broadcast_start_time,
      channel_identifier: requestData.channel_name
    });
    
    adDetectionsCollection.save(adDetection, function(err, doc) {
      if (err) {
        return response.error('An error occurred when trying to create the adDetection.');
      }
  
      /**/
      response.body = {
        'messages': ['New adDetection created with ID "' + adDetection._id + '".'],
        'adDetection': adDetection,
        'err': err,
        'doc': doc
      };
      /**/
      getAdAndAdBreak(adDetection);
    });
  };
  
  getAdAndAdBreak = function (adDetection) {
    var i, ad, adBreak, airing, channel,
        
        adsCollection = modules.collectionAccess.collection('ads'),
        adBreaksCollection = modules.collectionAccess.collection('adBreaks'),
        airingsCollection = modules.collectionAccess.collection('airings'),
        channelsCollection = modules.collectionAccess.collection('channels'),
        
        logger = modules.logger,
        createEntity = modules.utils.kinveyEntity;
    
    adsCollection.find({
      'ad_detection_identifier': adDetection.ad_identifier
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find ad "' + adDetection.ad_identifier + '".');
      }
      
      if (docs.length < 1) {
        /**/
        response.body.messages.push('No ad exists in the system with the detection ID "' + adDetection.ad_identifier + '".');
        /**/
        return response.complete(200);
      }
      
      ad = docs.pop();
      
      channelsCollection.find({
        'ad_detection_identifier': adDetection.channel_identifier
      }, function (err, docs) {
        if (err) {
          return response.error('An error occurred while trying to find channel "' + adDetection.channel_identifier + '".');
        }
        
        channel = docs.pop();
        
        airingsCollection.find({
          'is_currently_on': true
        }, function (err, docs) {
          if (err) {
            return response.error('An error occurred while trying to find an airing for channel "' + adDetection.channel_identifier + '".');
          }
          
          if (docs.length < 1) {
            return response.error('There is currently nothing airing on this channel.');
          }
          
          for (i = 0; i < docs.length; i++) {
            if (docs[i].channel._id == channel._id) {
              airing = docs[i];
            }
          }
          
          if (airing === undefined) {
            return response.error('There is currently nothing airing on this channel.');
          }
          
          adBreaksCollection.find({
            'is_currently_on': true,
          }, function (err, docs) {
            if (err) {
              return response.error('An error occurred while trying to find an adBreak for channel "' + adDetection.channel_identifier + '".');
            }
            
            for (i = 0; i < docs.length; i++) {
              if (docs[i].airing._id.toString() == airing._id.toString()) {
                adBreak = createEntity(docs[i]);
              }
            }
            
            if (adBreak === undefined) {
              adBreak = createEntity({
                'airing': createRelation('airings', airing._id),
                is_currently_on: true
              });
              
              adBreaksCollection.save(adBreak, function (err, doc) {
                if (err) {
                  return response.error('An error occurred when trying to create the adBreak.');
                }
                
                /**/
                response.body.messages.push('New adBreak created with ID "' + adBreak._id + '".');
                response.body.adBreak = adBreak;
                /**/
                createNewCron(adBreak);
              });
            } else {
              /**/
              response.body.messages.push('Existing adBreak found with ID "' + adBreak._id + '".');
              response.body.adBreak = adBreak;
              /**/
              updateCron(adBreak, adDetection);
            }
          });
        });
      });
      
    });
  };
  
  createNewCron = function (adBreak) {
    var adBreaksCollection = modules.collectionAccess.collection('adBreaks'),
        cronTasksCollection = modules.collectionAccess.collection('cronTasks'),

        http = modules.request,
        moment = modules.moment,
        createEntity = modules.utils.kinveyEntity,

        finishingAt = moment(adBreak._kmd.ect).add('minutes', 3),
        //cronStr = finishingAt.format('m H D M d'),
        //cronStr = finishingAt.format('mm HH * * *'),
        cronStr = finishingAt.format('mm HH DD MMM *'),

        cronTask = createEntity({
          type: 'finish-ad-break',
          adBreakID: adBreak._id,
          schedule: cronStr
        });

    cronTasksCollection.save(cronTask, function (err, doc) {
        if (err) {
          return response.error('An error occurred when trying to save the cronTask.');
        }

        http.post({
          'uri': 'http://api.cron.io/v1/crons',
          'auth': {
            'username': 'conor-appsie',
            'password': 'mighty girl trip constantly'
          },
          'headers': {
            'Content-Type': 'application/json'
          },
          'json': {
            'name': 'finish-ad-break-' + adBreak._id,
            'url': 'http://conor.smith:password@baas.kinvey.com/appdata/kid_PVgDjNCWFJ/cronTasks/' + cronTask._id,
            'schedule': cronStr
          }
        }, function (error, postResponse, body) {
          if (error) {
            return response.error(error.message);
          }
          
          adBreak.cronio_id = body.id;
          adBreaksCollection.save(adBreak, function (err, doc) {
            if (err) {
              return response.error('An error occurred when trying to save the adBreak.');
            }

            /**/
            response.body.messages.push('Created Cron.io task with ID "' + adBreak.cronio_id + '".');
            response.body.adBreak = adBreak;
            /**/
            return response.complete(200);
          });
        });
    });
  };
  
  updateCron = function (adBreak, adDetection) {
    var adBreaksCollection = modules.collectionAccess.collection('adBreaks'),

        http = modules.request,
        moment = modules.moment,

        finishingAt = moment(adDetection._kmd.ect).add('minutes', 3),
        //cronStr = finishingAt.format('m H D M * YYYY');
        cronStr = finishingAt.format('m H D M d');

    http.put({
      'uri': 'http://api.cron.io/v1/crons/' + adBreak.cronio_id,
      'auth': {
        'username': 'conor-appsie',
        'password': 'mighty girl trip constantly'
      },
      'headers': {
        'Content-Type': 'application/json'
      },
      'json': {
        'schedule': cronStr
      }
    }, function (error, postResponse, body) {
      if (error) {
        return response.error(error.message);
      }
      
      /**/
      response.body.messages.push('Updated Cron.io task with ID "' + adBreak.cronio_id + '".');
      response.body.adBreak = adBreak;
      /**/
      return response.complete(200);
    });
  };
  
  init();
}
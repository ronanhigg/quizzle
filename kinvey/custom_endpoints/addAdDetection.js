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
      updateCron,
      updatePusher;
  
  init = function () {
    setupResponse();
  };
  
  createRelation = function (collection, id) {
    return {
      _type: "KinveyRef",
      _collection: collection,
      _id: id,
    };
  };

  setupResponse = function () {
    response.body = {
      'messages': []
    };

    checkIfAdHasBeenDetected();
  };

  checkIfAdHasBeenDetected = function () {
    var requestData = request.body,
        adDetectionsCollection = modules.collectionAccess.collection('adDetections');

    adDetectionsCollection.find({
      'ad_detection_id': requestData.detid
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find ad with detection ID "' + requestData.detid + '".');
      }
      
      if (docs.length > 0) {
        /**/
        response.body.messages.push('An ad detection already exists in the system with the detection ID "' + requestData.detid + '".');
        /**/
        return response.complete(200);
      }

      createAdDetection();
    });
  };
  
  createAdDetection = function () {
    var adDetection,
        requestData = request.body,
        createEntity = modules.utils.kinveyEntity;
    
    if (requestData.type !== 'start') {
      /**/
      response.body.messages.push('No adDetection created as this request has type "' + requestData.type + '".');
      /**/
      return response.complete(200);
    }
    
    adDetection = createEntity({
      ad_detection_id: requestData.detid,
      ad_identifier: requestData.id,
      broadcast_finishing_at: requestData.broadcast_end_time,
      broadcast_starting_at: requestData.broadcast_start_time,
      channel_identifier: requestData.channel_name,
      has_ad_data: false,
      has_quiz_data: false
    });
    updatePusher(adDetection);

    checkIfChannelDataExists(adDetection);
  };

  checkIfChannelDataExists = function (adDetection) {
    var channelsCollection = modules.collectionAccess.collection('channels');

    channelsCollection.find({
      'ad_detection_identifier': adDetection.channel_identifier
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find channel "' + adDetection.channel_identifier + '".');
      }

      if (docs.length > 0) {
        channel = docs.pop();
        adDetection.channel = {
          '_type': 'KinveyRef',
          '_collection': 'channels',
          '_id': channelsCollection.objectID(channel._id)
        };

        checkIfAdDataExists(adDetection);
      } else {
        saveAdDetection(adDetection);
      }

    })
  };

  checkIfAdDataExists = function (adDetection) {
    var adsCollection = modules.collectionAccess.collection('ads');

    adsCollection.find({
      'ad_detection_identifier': adDetection.ad_identifier
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find ad "' + adDetection.ad_identifier + '".');
      }
      
      if (docs.length > 0) {
        ad = docs.pop();

        adDetection.has_ad_data = true;
        adDetection.ad = {
          '_type': 'KinveyRef',
          '_collection': 'ads',
          '_id': adsCollection.objectID(ad._id)
        }

        checkIfQuizDataExists(adDetection, ad.advertiser);
      } else {
        saveAdDetection(adDetection);
      }
    });
  };

  /* DEPRECATED

  checkIfAdvertiserDataExists = function (adDetection, advertiserRef) {
    var advertiersCollection = modules.collectionAccess.collection('advertisers');

    advertiersCollection.find({
      '_id': advertiersCollection.objectID(advertiserRef._id)
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find advertiser "' + advertiserRef._id + '".');
      }
      
      if (docs.length > 0) {
        advertiser = docs.pop();

        adDetection.advertiser_name = advertiser.name;
        adDetection.advertiser_logo = advertiser.logo_url;

        checkIfQuizDataExists(adDetection, advertiserRef);
      } else {
        saveAdDetection(adDetection);
      }

    })
  }*/

  checkIfQuizDataExists = function (adDetection, advertiserRef) {
    var quizzesCollection = modules.collectionAccess.collection('quizzes');

    quizzesCollection.find({
      'advertiser': advertiserRef
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find ad "' + adDetection.ad_identifier + '".');
      }
      
      if (docs.length > 0) {
        adDetection.has_quiz_data = true;
      }

      saveAdDetection(adDetection);
    });
  };

  saveAdDetection = function (adDetection) {
    var adDetectionsCollection = modules.collectionAccess.collection('adDetections');

    adDetectionsCollection.save(adDetection, function(err, doc) {
      if (err) {
        return response.error('An error occurred when trying to create the adDetection.');
      }
  
      /**/
      response.body.messags.push('New adDetection created with ID "' + adDetection._id + '".');
      response.body.adDetection = adDetection;
      response.body.err = err;
      response.body.doc = doc;
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

  //DS SQ1 061113 new function added
  updatePusher = function (adDetection) {
    var uri = 'http://tvadsync.sq1.io/push/'+adDetection.ad_identifier+'/'+adDetection.channel_identifier;
  
    var options = {
      uri: uri,
      method: 'GET'
    };
    var req = modules.request;

    req.request(options,function(error,res,body) {
      //response.body = body;
      //response.complete(res.status);
    });
    
    //return response.complete(200);
  };
  
  init();
}
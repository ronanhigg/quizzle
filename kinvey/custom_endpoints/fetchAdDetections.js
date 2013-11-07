function onRequest(request, response, modules){
  var i,

      async = modules.async,
      collectionAccess = modules.collectionAccess,
      entity = modules.utils.kinveyEntity,
      logger = modules.logger,

      adsCollection = collectionAccess.collection('ads'),
      adDetectionsCollection = collectionAccess.collection('adDetections'),
      advertisersCollection = collectionAccess.collection('advertisers'),
      channelsCollection = collectionAccess.collection('channels'),
      quizzesCollection = collectionAccess.collection('quizzes'),

      amount = request.body.amount,
      lastAdDetectionID = request.body.lastAdDetectionID;

  if (amount > 25) {
    amount = 25;
  } else if (amount < 1) {
    amount = 1;
  }

  init = function () {
    if (lastAdDetectionID) {
      fetchAdDetectionsEarlierThan(lastAdDetectionID);
    } else {
      fetchLatestAdDetections();
    }
  };

  fetchLatestAdDetections = function () {
    adDetectionsCollection.find({}, {
      limit: amount,
      sort: [['_kmd.ect', -1]]
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find ad detections.');
      }

      async.each(docs, fetchRelationalData, function (err) {
        if (err) {
          return response.error('An error occurred while trying to find relational data for ad detections.');
        }

        response.body = {
          'amount': amount,
          'lastAdDetectionID': lastAdDetectionID,
          'docs': docs
        };
        
        response.complete(200);
      });
    });
  };

  fetchAdDetectionsEarlierThan = function (adDetectionID) {
    adDetectionsCollection.findOne({
      '_id': adDetectionsCollection.objectID(adDetectionID)
    }, function (err, doc) {
      if (err) {
        return response.error('An error occurred while trying to find last ad detection.');
      }

      if (!doc) {
        fetchLatestAdDetections();
      }

      adDetectionsCollection.find({
        '_kmd.ect': {"$lt": doc._kmd.ect}
      }, {
        limit: amount,
        sort: [['_kmd.ect', -1]]
      }, function (err, docs) {
        if (err) {
          return response.error('An error occurred while trying to find ad detections.');
        }

        async.each(docs, fetchRelationalData, function (err) {
          if (err) {
            return response.error('An error occurred while trying to find relational data for ad detections.');
          }

          response.body = {
            'amount': amount,
            'lastAdDetectionID': lastAdDetectionID,
            'docs': docs
          };
          
          response.complete(200);
        });
      });
    })
  };

  fetchRelationalData = function (adDetection, asyncCallback) {
    appendChannelData(adDetection, asyncCallback);
  };

  appendChannelData = function (adDetection, asyncCallback) {
    channelsCollection.findOne({
      'ad_detection_identifier': adDetection.channel_identifier
    }, function (err, doc) {
      if (err) {
        return response.error('An error occurred while trying to append channel data to ad detection "' + adDetection._id + '".');
      }

      adDetection.channelName = doc.name;
      appendAdData(adDetection, asyncCallback);
    });
  };

  appendAdData = function (adDetection, asyncCallback) {
    adsCollection.findOne({
      'ad_detection_identifier': adDetection.ad_identifier
    }, function (err, doc) {
      if (err) {
        return response.error('An error occurred while trying to append ad data to ad detection "' + adDetection._id + '".');
      }

      if (doc) {
        adDetection.adTitle = doc.title;
        adDetection.storyboardURL = doc.storyboard_url;
        adDetection.advertiserID = doc.advertiser._id;

        appendAdvertiserData(adDetection, asyncCallback);
      } else {
        adDetection.noAdData = true;

        asyncCallback();
      }
    });
  };

  appendAdvertiserData = function (adDetection, asyncCallback) {
    advertisersCollection.findOne({
      '_id': advertisersCollection.objectID(adDetection.advertiserID)
    }, function (err, doc) {
      if (err) {
        return response.error('An error occurred while trying to append advertiser data to ad detection "' + adDetection._id + '".');
      }

      if (doc) {
        adDetection.advertiserName = doc.name;
        adDetection.advertiserLogo = doc.logo_url;
      } else {
        adDetection.noAdvertiserData = true;
      }
      
      appendIncorrectLogos(adDetection, asyncCallback);
    })
  };

  appendIncorrectLogos = function (adDetection, asyncCallback) {
    advertisersCollection.find({}, function (err, docs) {
      var i, randomLogo,
          limit = docs.length < 3 ? docs.length : 3;

      if (err) {
        return response.error('An error occurred while trying to append logo data to ad detection "' + adDetection._id + '".');
      }

      adDetection.otherLogos = [];
      while (adDetection.otherLogos.length < limit) {
        randomLogo = docs[Math.floor(Math.random() * docs.length)].logo_url;
        if (randomLogo !== adDetection.advertiserLogo) {
          if (adDetection.otherLogos.indexOf(randomLogo) === -1) {
            adDetection.otherLogos.push(randomLogo);
          }
        }
      }

      appendQuiz(adDetection, asyncCallback);
    })
  };

  appendQuiz = function (adDetection, asyncCallback) {
    quizzesCollection.find({
      'advertiser': {
        "_type": "KinveyRef",
        "_collection": "advertisers",
        "_id": adDetection.advertiserID
      }
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to append quiz data to ad detection "' + adDetection._id + '".');
      }

      if (docs.length < 1) {
        adDetection.noQuizData = true;
      } else {
        adDetection.question = docs[Math.floor(Math.random() * docs.length)]
      }

      asyncCallback();
    });
  };

  init();
}
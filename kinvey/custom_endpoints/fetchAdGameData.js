function onRequest(request, response, modules){
  var i, totalAmount,

    async = modules.async,
    collectionAccess = modules.collectionAccess,
    entity = modules.utils.kinveyEntity,
    logger = modules.logger,

    adsCollection = collectionAccess.collection('ads'),
    adDetectionsCollection = collectionAccess.collection('adDetections'),
    advertisersCollection = collectionAccess.collection('advertisers'),
    channelsCollection = collectionAccess.collection('channels'),
    quizzesCollection = collectionAccess.collection('quizzes'),

    adDetectionID = request.body.id;

  init = function () {
    fetchAdDetection(adDetectionID);
  };

  fetchAdDetection = function (adDetectionID) {
    adDetectionsCollection.findOne({
      '_id': adDetectionsCollection.objectID(adDetectionID)
    }, function (err, doc) {
      if (err) {
        return response.error('An error occurred while trying to find last ad detection.');
      }

      fetchRelationalData(doc, function (adDetection) {

        response.body = adDetection;
        
        return response.complete(200);

      });
    });
  };

  /*fetchAdDetections = function (completionCallback) {
    if (lastAdDetectionID) {
      fetchAdDetectionsEarlierThan(lastAdDetectionID, completionCallback);
    } else {
      fetchLatestAdDetections(completionCallback);
    }
  };

  fetchLatestAdDetections = function (completionCallback) {
    var conditions = {};

    if (!includeAdlessDetections) {
      conditions.has_ad_data = true;
    }

    if (!includeTrivialessDetections) {
      conditions.has_quiz_data = true;
    }

    var limit = amount;

    var options = {
      limit: limit,
      //sort: [['_kmd.ect', -1]]
      sort: [['broadcast_starting_at', -1]]
    };

    adDetectionsCollection.find(conditions, options, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find ad detections.');
      }
        
      if (docs.length == 0) {
        return completionCallback();
      }

      async.each(docs, fetchRelationalData, function (err) {
        addDocsToAdDetectionsToReturn(err, docs, completionCallback);
      });
    });
  };

  fetchAdDetectionsEarlierThan = function (adDetectionID, completionCallback) {
    if (typeof adDetectionID === 'string') {
      adDetectionID = adDetectionsCollection.objectID(adDetectionID);
    }

    adDetectionsCollection.findOne({
      '_id': adDetectionID
    }, function (err, doc) {
      if (err) {
        return response.error('An error occurred while trying to find last ad detection.');
      }

      if (!doc) {
        fetchLatestAdDetections();
      }

      var conditions = {
        '_kmd.ect': {"$lt": doc._kmd.ect}
        //'broadcast_starting_at': {"$lt": doc.broadcast_starting_at}
      };

      if (!includeAdlessDetections) {
        conditions.has_ad_data = true;
      }

      if (!includeTrivialessDetections) {
        conditions.has_quiz_data = true;
      }

      var limit = amount;

      var options = {
        limit: limit,
        //sort: [['_kmd.ect', -1]]
        sort: [['broadcast_starting_at', -1]]
      };

      adDetectionsCollection.find(conditions, options, function (err, docs) {

        if (err) {
          return response.error('An error occurred while trying to find ad detections.');
        }

        if (docs.length == 0) {
          return completionCallback();
        }

        async.each(docs, fetchRelationalData, function (err) {
          addDocsToAdDetectionsToReturn(err, docs, completionCallback);
        });
      });
    });
  };

  addDocsToAdDetectionsToReturn = function (err, docs, completionCallback) {
    var adlessDetections = 0;

    if (err) {
      return response.error('An error occurred while trying to find relational data for ad detections.');
    }

    if (includeAdlessDetections && includeTrivialessDetections) {
      adDetectionsToReturn = docs;

    } else {

      for (i = 0; i < docs.length && adDetectionsToReturn.length < totalAmount; i++) {

        if (!includeAdlessDetections && docs[i].noAdData) {
          adlessDetections++;
        } else if (!includeTrivialessDetections && docs[i].noQuizData) {
          adlessDetections++;
        } else {
          adDetectionsToReturn.push(docs[i]);
        }
      }

      lastAdDetectionID = docs[docs.length - 1]._id;
      amount = adlessDetections;
    }

    completionCallback();
  };*/

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

        asyncCallback(adDetection);
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

      asyncCallback(adDetection);
    });
  };

  init();
}
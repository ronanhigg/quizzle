function onPostSave(request, response, modules) {
    var logger = modules.logger;

    logger.info('Post Save for ads has been called.');

    var ad = response.body;

    var adDetectionsCollection = modules.collectionAccess.collection('adDetections');
    var quizzesCollection = modules.collectionAccess.collection('quizzes');

    quizzesCollection.find({
      'advertiser._id': ad.advertiser._id
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find related quizzes.');
      }

      var hasQuizData = docs.length > 0;

      adDetectionsCollection.update({
          ad_identifier: ad.ad_detection_identifier
      }, {
          '$set': {
              ad: {
                  '_type': 'KinveyRef',
                  '_collection': 'ads',
                  '_id': modules.collectionAccess.collection('ads').objectID(ad._id)
              },
              advertiser: ad.advertiser,
              has_ad_data: true,
              has_quiz_data: hasQuizData
          }
      }, {
          multi: true
      }, function (err, result) {
          logger.info('Update operation callback executed.');
          logger.info('Err [' + err + ']');
          logger.info('Result [' + result + ']');
          return response.continue();
      });
    });
}

function onPreDelete(request, response, modules) {
    var logger = modules.logger;

    logger.info('Pre Delete for ads has been called.');

    var adsCollection = modules.collectionAccess.collection('ads');
    var adDetectionsCollection = modules.collectionAccess.collection('adDetections');

    adsCollection.find({
      '_id': adsCollection.objectID(request.entityId)
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find the ad.');
      }

      var ad = docs.pop();

      adDetectionsCollection.update({
          ad_identifier: ad.ad_detection_identifier
      }, {
          '$set': {
              has_ad_data: false,
              has_quiz_data: false
          },
          '$unset': {
              ad: '',
              advertiser: ''
          }
      }, {
          multi: true
      }, function (err, result) {
          logger.info('Update operation callback executed.');
          logger.info('Err [' + err + ']');
          logger.info('Result [' + result + ']');
          return response.continue();
      });
    });
}
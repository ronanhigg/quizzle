function onPostSave(request, response, modules) {
    var logger = modules.logger;

    logger.info('Post Save for advertisers has been called.');

    var advertiser = request.body;

    var adDetectionsCollection = modules.collectionAccess.collection('adDetections');
    var quizzesCollection = modules.collectionAccess.collection('quizzes');

    quizzesCollection.find({
      'advertiser._id': advertiser._id
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find related quizzes.');
      }

      var hasQuizData = docs.length > 0;

      adDetectionsCollection.update({
          'advertiser._id': advertiser._id
      }, {
          '$set': {
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
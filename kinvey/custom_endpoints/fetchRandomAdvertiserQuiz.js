function onRequest(request, response, modules) {
  var logger = modules.logger;

  var advertisersCollection = modules.collectionAccess.collection('advertisers');
  var quizzesCollection = modules.collectionAccess.collection('quizzes');

  var advertiserID = request.body.id;

  init = function () {
    fetchQuizzes(advertiserID);
  };

  fetchQuizzes = function (advertiserID) {
    quizzesCollection.find({
      'advertiser': {
        '_type': 'KinveyRef',
        '_collection': 'advertisers',
        '_id': advertiserID
      }
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find last ad detection.');
      }

      selectRandomQuiz(docs);
    });
  };

  selectRandomQuiz = function (quizzes) {
    logger.info(quizzes);
    logger.info(getRandomInt(0, quizzes.length));
    logger.info(quizzes[getRandomInt(0, quizzes.length)]);
    completeAction(quizzes[getRandomInt(0, quizzes.length - 1)]);
  };

  completeAction = function (quiz) {
    response.body = quiz;
    return response.complete(200);
  };

  getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  init();
}
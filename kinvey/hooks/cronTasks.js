function onPreFetch(request, response, modules){
  var logger = modules.logger,
      convertToObjectID = modules.collectionAccess.objectID,

      cronTaskID = convertToObjectID(request.entityId),
      cronTask,
      adBreak,

      init,
      fetchCronTask,
      fetchAdBreak,
      deleteCronTask,
      setAdBreakToNoLongerBeingOn;

  init = function () {
    fetchCronTask();
  };

  fetchCronTask = function () {
    var cronTasksCollection = modules.collectionAccess.collection('cronTasks');

    logger.info(cronTaskID);

    cronTasksCollection.find({
      '_id': cronTaskID
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find cronTask "' + cronTaskID + '".');
      }

      if (docs.length < 1) {
        logger.info('No cronTask exists in the system with the ID "' + cronTaskID + '".');
        return response.complete(200);
      }

      cronTask = docs.pop();

      fetchAdBreak();
    });
  };

  fetchAdBreak = function () {
    var adBreaksCollection = modules.collectionAccess.collection('adBreaks');

    logger.info('Fetching adBreak');

    adBreaksCollection.find({
      '_id': convertToObjectID(cronTask.adBreakID.toString())
    }, function (err, docs) {
      if (err) {
        return response.error('An error occurred while trying to find ad Break "' + cronTask.adBreakID + '".');
      }

      if (docs.length < 1) {
        logger.info('No ad break exists in the system with the ID "' + cronTask.adBreakID + '".');
        return response.complete(200);
      }

      adBreak = docs.pop();

      deleteCronTask();
    });
  };
  
  deleteCronTask = function () {
    var cronTasksCollection = modules.collectionAccess.collection('cronTasks'),

        http = modules.request;

    logger.info('Deleting cronTask from Cron.io');

    http.del({
      'uri': 'http://api.cron.io/v1/crons/' + adBreak.cronio_id,
      'auth': {
        'username': 'conor-appsie',
        'password': 'mighty girl trip constantly'
      }
    }, function (error, postResponse, body) {
      if (error) {
        return response.error(error.message);
      }

      logger.info('Deleting cronTask from Kinvey');

      cronTasksCollection.remove({
        '_id': cronTask._id,
      }, {}, function (err, numberOfRemovedDocs) {
        if (err) {
          return response.error('An error occurred while trying to remove cronTask "' + cronTask._id + '".');
        }

        setAdBreakToNoLongerBeingOn();
      });
    });
  };

  setAdBreakToNoLongerBeingOn = function () {
    var adBreaksCollection = modules.collectionAccess.collection('adBreaks');

    logger.info('Setting adBreak.is_currently_on to false');

    adBreak.is_currently_on = false;

    adBreaksCollection.save(adBreak, function (err, doc) {
        if (err) {
          return response.error('An error occurred when trying to save the adBreak.');
        }

        logger.info('Complete');
        return response.complete(200);
    });
  };

  init();

  return response.complete(200);
}
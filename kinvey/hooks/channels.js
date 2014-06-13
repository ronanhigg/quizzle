function onPostSave(request, response, modules) {
    var logger = modules.logger;

    logger.info('Post Save for channels has been called.');

    var channel = request.body;

    var adDetectionsCollection = modules.collectionAccess.collection('adDetections');

    adDetectionsCollection.update({
        channel_identifier: channel.ad_detection_identifier
    }, {
        '$set': {
            channel: {
                '_type': 'KinveyRef',
                '_collection': 'channels',
                '_id': modules.collectionAccess.collection('channels').objectID(channel._id)
            }
        }
    }, {
        multi: true
    }, function (err, result) {
        logger.info('Update operation callback executed.');
        logger.info('Err [' + err + ']');
        logger.info('Result [' + result + ']');
        return response.continue();
    });
}
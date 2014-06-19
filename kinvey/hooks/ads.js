function onPostSave(request, response, modules) {
    var logger = modules.logger;

    logger.info('Post Save for ads has been called.');

    var ad = request.body;

    var adDetectionsCollection = modules.collectionAccess.collection('adDetections');

    adDetectionsCollection.update({
        ad_identifier: ad.ad_detection_identifier
    }, {
        '$set': {
            ad: {
                '_type': 'KinveyRef',
                '_collection': 'ads',
                '_id': modules.collectionAccess.collection('ads').objectID(ad._id)
            },
            has_ad_data: true
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
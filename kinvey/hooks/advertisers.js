/* DEPRECATED

function onPostSave(request, response, modules) {
    var logger = modules.logger;

    logger.info('Post Save for advertisers has been called.');

    var advertiser = request.body;

    var adDetectionsCollection = modules.collectionAccess.collection('adDetections');
    var adsCollection = modules.collectionAccess.collection('ads');

    adsCollection.find({
        'advertiser': {
            '_type': 'KinveyRef',
            '_collection': 'advertisers',
            '_id': advertiser._id
          }
    }, function (err, docs) {
        if (err) {
            logger.error('Could not find ad for "' + advertiser._id + '".');
            return response.error();
        }

        if (docs.length < 1) {
            logger.info('No ad exists in the system for the advertiser ID "' + advertiser._id + '".');
            return response.continue();
        }

        modules.async.each(docs, function (ad, asyncCallback) {

            adDetectionsCollection.update({
                ad_identifier: ad.ad_detection_identifier
            }, {
                '$set': {
                    advertiser_name: advertiser.name,
                    advertiser_logo: advertiser.logo_url
                }
            }, {
                multi: true
            }, function (err, result) {
                logger.info('Update operation callback executed.');
                logger.info('Err [' + err + ']');
                logger.info('Result [' + result + ']');
                asyncCallback();
            });

        }, function (err) {
            if (err) {
                logger.error('Error in async callback');
                return response.error();
            } else {
                logger.error('Async callback executed.');
                return response.continue();
            }
        });

    });
}*/
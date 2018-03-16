const _ = require('underscore'),
  async = require('async');
var mysqlDao = require('../aws/mysqlDAO');
/**
 * @param {Object} userInfo
 * @param {string} userInfo.userId
 * @param {number} userInfo.reviewDayCount
 */
function updateReviewResult(userInfo, cb) {
  if (!userInfo || !userInfo.userId || !userInfo.reviewDayCount) {
    console.log('updateReviewResult] wrong parameter');
  }

  async.parallel(
    [
      callback => mysqlDao.getCardsForUpdate({ reviewResult: 1 }, callback),  // passCards
      callback => mysqlDao.getCardsForUpdate({ reviewResult: 0 }, callback)   // failCards
    ],
    (err, results) => {
      var passCardsUpdated, failCardUpdated;
      // pass 처리
      passCardsUpdated = _.map(results[0], card => {
        let cardLevel = card.cardLevel;
        let reviewDates = card.reviewDates.split(',').map(val => Number(val));  // string -> number[]
        let nRDC = card.referenceDayCount + reviewDates[cardLevel] - 1;
        return { id: card.id, reviewResult: -1, nextReviewDayCount: nRDC, cardLevel: cardLevel + 1 };
      });
      // fail 처리
      failCardUpdated = _.map(results[1], card => {
        return { id: card.id, reviewResult: -1, nextReviewDayCount: userInfo.reviewDayCount, referenceDayCount: userInfo.reviewDayCount, cardLevel: 1 };
      });

      console.log(`pass cards[${passCardsUpdated.length}] fail cards[${failCardUpdated.length}]`)
      async.parallel(
        [
          callback => mysqlDao.updateCardReviewResult(failCardUpdated, callback),
          callback => mysqlDao.updateCardReviewResult(passCardsUpdated, callback)
        ],
        (err, results) => {
          console.log('done')
          cb(err, results);
        }
      )
    }
  );
}



module.exports = {
  updateReviewResult
}
const _       = require('underscore'),
      async   = require('async');
var mysqlDao = require('../aws/mysqlDAO');
/**
 * @param {Object} userInfo
 * @param {string} userInfo.userId
 * @param {number} userInfo.reviewDayCount
 */
function updateReviewResult(userInfo) {
  if (!userInfo || !userInfo.userId || !userInfo.reviewDayCount) {
    console.log('updateReviewResult] wrong parameter');
  }

  var userReviewDayCount = userInfo.reviewDayCount;
  console.log('up', userInfo);
  return;

  async.parallel([
    (callback) => {
      mysqlDao.getCardsForUpdate({reviewResult: 0}, callback) // passCards
    },
    (callback) => {
      mysqlDao.getCardsForUpdate({reviewResult: 1}, callback) // failCards
    }
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
      return { id: card.id, reviewResult: -1, nextReviewDayCount: userReviewDayCount, referenceDayCount: userReviewDayCount, cardLevel: card.cardLevel };
    });
  
    mysqlDao.updateCardReviewResult(passCardsUpdated);
  });
}



module.exports = {
  updateReviewResult
}
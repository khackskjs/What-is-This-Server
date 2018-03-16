var mysqlDao      = require('../aws/mysqlDAO'),
    cardService   = require('../service/cardService');

function login(userInfoReq, res) {
  mysqlDao.getLogin(userInfoReq, (err, results, fields) => {
    if (err) console.error(new Error());
    if (results.length !== 1 || results[0].userId !== userInfoReq.userId) {
      return res.json({});
    }
    
    var returnUserInfo = renewLoginUserInfo(results[0], userInfoReq);
    
    // 학습 일자 변경됐을 경우, user 정보 update 및, card.reviewResult update
    if (results[0].reviewDayCount !== returnUserInfo.reviewDayCount) {
      cardService.updateReviewResult(returnUserInfo, (err, result) => {
        var text = `update card review result`
        if(err) return console.error(`${text}`);
        console.log(`${text} result:`, result);
      });
    }
    
    userInfoReq.reviewDayCount = returnUserInfo.reviewDayCount;
    // 최종 로그인 시간 업데이트
    mysqlDao.updateUserLoginInfo(userInfoReq, (err, results) => {
      if (err) console.error(new Error());
      console.log(`USER[${userInfoReq.userId}] lastLoginDatetime[${userInfoReq.lastLoginDatetime}] is updated`);

      res.json(returnUserInfo);
    });
  });
}

/**
 * 로그인 성공 후, user 정보를 갱신하기 위함
 * @param {UserInformation} userInfoDB - DB 에서 받은 데이터
 * @param {UserInformation} userInfoReq - Login 시도를 위해 Client로 부터 받은 데이터
 * @returns {UserInformation} DB 로 받은 userInformation을 가공 후 리턴
 */
function renewLoginUserInfo(userInfoDB, userInfoReq) {
  var userInfo = JSON.parse(JSON.stringify(userInfoDB)),
      dateDB = new Date(userInfo.lastLoginDatetime || Date.now()),
      dateReq= new Date(userInfoReq.lastLoginDatetime || Date.now()),
      dayDB = dateDB.getDate(),
      dayReq = dateReq.getDate();
  
  // login 성공하면, 필요없는 부분은 제거하고 user에 전달 예정
  delete userInfo.id;
  delete userInfo.userPw;

  // 최종 로그인한 시간을 기준으로, reviewDayCount를 증가 시킬지 계산해야.
  userInfo.reviewDayCount = dayDB === dayReq ? userInfo.reviewDayCount : userInfo.reviewDayCount + 1;

  return userInfo;
}

module.exports = {
  login
}
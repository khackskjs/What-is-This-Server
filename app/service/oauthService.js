var mysqlDao      = require('../aws/mysqlDAO'),
    cardService   = require('../service/cardService');

async function login(oauthInfoReq, res) {
  try {
    const loginResult = await mysqlDao.getOauth(oauthInfoReq);

    // 최초 로그인 일 경우 등록 후 reviewDayCount = 1 리턴하고, 
    if (loginResult.length === 0) {
      return proceedRegisterOauth(oauthInfoReq, res);
    }
    else if (loginResult.length !== 1 || loginResult[0].email !== oauthInfoReq.email) {
      console.error('oauthService:login] user login result is wrong', loginResult);
      return res.json({});
    }
    else {
      return proceedOauthLogin(oauthInfoReq, loginResult[0], res);
    }
  }
  catch (err) {
    console.error('_login: ', err);
  }
}
async function proceedOauthLogin(oauthReq, oauthDB, res) {
  const returnOauthInfo = renewLoginUserInfo(oauthDB, oauthReq);
  // 학습 일자 변경됐을 경우, user 정보 update 및, card.reviewResult update
  if (oauthDB.reviewDayCount !== returnOauthInfo.reviewDayCount) {
    try {
      await cardService.updateReviewResultOauth(returnOauthInfo);
      console.log('response: oauth', returnOauthInfo);
      res.json(returnOauthInfo);
    }
    catch(err) {
      console.error('oauthService:login:updateReviewResultOauth:CB] err', err);
      res.status(500);
      res.json( new Error(`Failed to update previous reviewed cards`));
    }
  }
  else {
    try {
      // 최종 로그인 시간 업데이트
      await mysqlDao.updateOauthLoginInfo(returnOauthInfo);
      console.log(`OAUTH [${returnOauthInfo.email}] lastLoginDatetime[${returnOauthInfo.lastLoginDatetime}] is updated`);
      res.json(returnOauthInfo);
    }
    catch(err) {
      console.error(`Failed to update current oauth login information`, err);
      res.json(err);
    }
  }
}
/**
 *  oauth user 를 추가함
 * @param {OauthInformation} oauthInfo 
 */
async function proceedRegisterOauth(oauthInfo) {
  try {
    const registerResult = await mysqlDao.insertOauth(oauthInfo);
    console.info('OAUTH user[%s | %s %s] registered', oauthInfo.email, oauthInfo.givenName, oauthInfo.familyName);
    return res.json({ reviewDayCount: 1, lastLoginDatetime: oauthInfo.lastLoginDatetime });
  }
  catch(err) {
    console.error('registerOauth:CB] err', err);
    return res.status(500);
  }
}
/**
 * 로그인 성공 후, user 정보를 갱신하기 위함
 * @param {UserInformation} oauthInfoDB - DB 에서 받은 데이터
 * @param {UserInformation} oauthInfoReq - Login 시도를 위해 Client로 부터 받은 데이터
 * @returns {UserInformation} DB 로 받은 userInformation을 가공 후 리턴
 */
function renewLoginUserInfo(oauthInfoDB, oauthInfoReq) {
  const oauthInfo = JSON.parse(JSON.stringify(oauthInfoDB));
  const dayDB = new Date(oauthInfo.lastLoginDatetime || Date.now()).getDate();
  const dayReq = new Date(oauthInfoReq.lastLoginDatetime || Date.now()).getDate();
  
  // login 성공하면, 필요없는 부분은 제거하고 user에 전달 예정
  delete oauthInfo.id;

  // 최종 로그인한 시간을 기준으로, reviewDayCount를 증가 시킬지 계산해야.
  oauthInfo.reviewDayCount = dayDB === dayReq ? oauthInfo.reviewDayCount : oauthInfo.reviewDayCount + 1;
  oauthInfo.lastLoginDatetime = oauthInfoReq.lastLoginDatetime;

  return oauthInfo;
}


module.exports = {
  login
}
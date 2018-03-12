mysqlDao = require('../aws/mysqlDAO');

module.exports = function(app, db) {

  app.post('/card', (req, res) => {
    console.log('>>> POST', req.body);
    mysqlDao.addCard(req.body, (err, result) => {
      res.json(result);
    });
  })
  
  app.get('/card', (req, res) => {
    console.log('>>> GET', req.query);
    mysqlDao.getCards(req.query, (err, results, fields) => {
      console.log(`  results.length: ${results.length}`);
      console.log(`  fields.length: ${fields.length}`);
      res.json(results);
    });
  });

  app.post('/user/login', async (req, res) => {
    console.log('>>> POST', req.body);
    
    var userInfo = req.body;
    if(userInfo.lastLoginDatetime) {
      userInfo.lastLoginDatetime = new Date(userInfo.lastLoginDatetime);
    }
    
    mysqlDao.getLogin(userInfo, (err, results, fields) => {
      if (err) console.error(new Error());
      
      if (results.length === 1 && results[0].userId === userInfo.userId) {
        var returnUserInfo = renewLoginUserInfo(results[0]);
        
        
        console.log(returnUserInfo);
        // 최종 로그인한 시간을 기준으로, reviewDayCount를 증가 시킬지 계산해야.


        // 최종 로그인 시간 업데이트
        mysqlDao.updateUserLastUpdateTime(userInfo, (err, results) => {
          if (err) console.error(new Error());
          console.log(`USER[${userInfo.userId}] lastLoginDatetime[${userInfo.lastLoginDatetime}] is updated`);

          res.json(returnUserInfo);
        });
      }
      else {
        res.json({});
      }

    });
  });
};
/**
 * 로그인 성공 후, user 정보를 갱신하기 위함
 * @param {UserInformation} userInfoDB - DB 에서 받은 데이터
 * @param {UserInformation} userInfoReq - Login 시도를 위해 Client로 부터 받은 데이터
 */
function renewLoginUserInfo(userInfoDB, userInfoReq) {
  var userInfo = JSON.parse(JSON.stringify(userInfoDB));
  // login 성공하면, 필요없는 부분은 제거하고 user에 전달 예정
  delete userInfo.id;
  delete userInfo.userPw;
  


}
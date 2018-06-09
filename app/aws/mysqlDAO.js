const mysql = require('mysql'),
      _ = require('underscore'),
      CARD_TBL = 'test',
      USER_TBL = 'user',
      OAUTH_TBL = 'oAuth';

const USER_ID = 'userId', USER_PW = 'userPw', USER_LAST_LOGIN_DATETIME = 'lastLoginDatetime', USER_REVIEW_DAY_COUNT = 'reviewDayCount',
      CARD_NEXT_REVIEW_DAY_COUNT = 'nextReviewDayCount', CARD_REVIEW_RESULT = 'reviewResult',
      OAUTH_G_NAME = 'givenName', OAUTH_F_NAME = 'familyName', OAUTH_MAIL = 'email', OAUTH_LAST_LOGIN_DATETIME = 'lastLoginDatetime', OAUTH_REVIEW_DAY_COUNT = 'reviewDayCount'
      ;

var connection = mysql.createConnection({
  host     : 'awsdatabase.coygvosyq5mp.ap-northeast-2.rds.amazonaws.com', //process.env.RDS_HOSTNAME,
  database : 'what_is_that',
  user     : 'admin',//process.env.RDS_USERNAME,
  password : 'tjddktkfkdgo',//process.env.RDS_PASSWORD,
  port     : 3306//process.env.RDS_PORT
});

/**
 * 
 * @param {String} sql 
 */
function logDao(sql) {
  console.log(`${sql};`);
}

connection.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  
  logDao('Connected to database');
});


function addCard(userInput, cb) {
  let query = connection.query(`INSERT INTO ${CARD_TBL} SET ?`, userInput, (err, results, fields) => {
    if(err) {
      return console.error(err);
    }
    logDao(`result: ${JSON.stringify(results)}`);
    cb(err, results);
  })
  logDao(query.sql);
}

/**
 *  요청한 복습 일자에 해당하는 user의 카드를 반환.
 * card.nextReviewDayCount <= user.reviewDayCount 일 경우.
 * 
 * @param {Object} uio - UserInput Option 중 WHERE 에 사용하고 싶은 멤버만 파라미터로 전달
 * @param {String} uio.userId
 * @param {Number} uio.reviewDayCount
 */
function getCards(uio) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM ?? WHERE ?? = ? and ?? <= ?`
    const options = [CARD_TBL, USER_ID, mysql.escape(uio[USER_ID]), CARD_NEXT_REVIEW_DAY_COUNT, mysql.escape(uio[USER_REVIEW_DAY_COUNT])];
    const query = mysql.format(sql, options);
    
    connection.query(query, (err, results, fields) => {
      if (err) return reject(err);
      return resolve(results);
    });
    logDao(query);
  });
}
/**
 * 
 * @param {Object} cardInfo 
 * @param {number} cardInfo.id
 * @param {number} cardInfo.reviewResult - NONE: 0, PASS: 1, FAIL: 2
 * @param {Function} cb 
 */
function updateCard(cardInfo, cb) {
  var updateResult, query,
      sql = `UPDATE ${CARD_TBL} SET ${CARD_REVIEW_RESULT} = ? WHERE id = ?`;

  query = connection.query(sql, [cardInfo.reviewResult, mysql.escape(cardInfo.id)], (err, result) => {
    if (err) throw err;
    cb(err, result);
  });
  logDao(query.sql);
}

/**
 *  id, pw 로만 이루어진 object 를 통해 login을 시도.
 * @param {UserInformation} userInfo 
 * @param {String}          userInfo.userId
 * @param {String}          userInfo.userPw
 */
function getLogin(userInfo, cb) {
  var loginResult,
      sql = "SELECT * FROM ?? WHERE ?? = ? and ?? = ?",
      options = [USER_TBL, USER_ID, mysql.escape(userInfo[USER_ID]), USER_PW, mysql.escape(userInfo[USER_PW])];
  
  sql = mysql.format(sql, options);

  connection.query(sql, (err, results, fields) => {
    if (err) throw err;
    cb(err, results, fields);
  });
  logDao(sql);;
}
function updateUserLoginInfo(userInfo, cb) {
  var updateResult, query,
      sql = `UPDATE ${USER_TBL} SET ${USER_LAST_LOGIN_DATETIME} = ?, ${USER_REVIEW_DAY_COUNT} = ?`;

  query = connection.query(sql, [userInfo.lastLoginDatetime, userInfo.reviewDayCount], (err, results, fields) => {
    if (err) throw err;
    cb(err, results);
  });
  logDao(query.sql)
}
/**
 *  email 만 이용해서 user 정보 가져 올 것.
 * @param {Object} oauthInfo 
 * @param {string} oauthInfo.email
 */
async function getOauth(oauthInfo) {
  var loginResult,
      sql = `SELECT * FROM ?? WHERE ?? = ?`,
      options = [OAUTH_TBL, OAUTH_MAIL, mysql.escape(oauthInfo[OAUTH_MAIL])];

  sql = mysql.format(sql, options);

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, results, fields) => {
      if(err) return reject(err);
      return resolve(results);
    })
    logDao(sql);
  });
}

function insertOauth(oauthInfo) {
  return new Promise((resolve, reject) => {
    let query = connection.query(`INSERT INTO ${OAUTH_TBL} SET ?`, oauthInfo, (err, results) => {
      if(err) return reject(err);
      return resolve(results);
    });
    logDao(query.sql);
  })
}
function updateOauthLoginInfo(oauth) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE ${OAUTH_TBL} SET ${OAUTH_LAST_LOGIN_DATETIME} = ?, ${OAUTH_REVIEW_DAY_COUNT} = ?`;
    const query = connection.query(sql, [oauth.lastLoginDatetime, oauth.reviewDayCount], (err, results, fields) => {
      if (err) return reject(err);
      return resolve(results);
    });
   logDao(query.sql)
  });
}

/**
 *  reviewResult를 바탕으로 리뷰 결과를 업데이트 하기 위함
 * 
 *  @example  for pass card
 *      INSERT INTO test (id,reviewResult,nextReviewDayCount,cardLevel) VALUES (5,-1,2,2),(6,-1,2,2) 
 *      ON DUPLICATE KEY UPDATE id=VALUES(id),reviewResult=VALUES(reviewResult),nextReviewDayCount=VALUES(nextReviewDayCount),cardLevel=VALUES(cardLevel)
 */
function updateCardReviewResult(cards, cb) {
  return new Promise((resolve, reject) => {
    if(!Array.isArray(cards)) {
      return reject(`wrong parameter`);
    }
    else if (cards.length === 0) {
      return resolve({ affectedRows: 0 });
    }

    const fieldNameArray = Object.keys(cards[0]);
    const fieldNamesSql = fieldNameArray.join(',');
    const passValueArray = _.map(cards, card => Object.values(card).join(','));
    const keyUpdateFields = _.map(fieldNameArray, field => `${field}=VALUES(${field})`);
    const sql = `INSERT INTO ${CARD_TBL} (${fieldNamesSql}) VALUES (${passValueArray.join('),(')}) ON DUPLICATE KEY UPDATE ${keyUpdateFields.join(',')}`;
  
    connection.query(sql, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    })
    logDao(sql);
  });
}
/**
 *  card review 결과를 업데이트 하기 위함
 * @param {Object} options
 * @param {string} options.userId - user 가 요청 할 경우, 해당 ID 만 업데이트 함
 * @param {number} options.reviewResult - fail: 0, none: -1, pass: 1
 * @param {function} cb 
 */
function getCardsForUpdate(options, cb) {
  var refRR = options.reviewResult,
      // sqlRevRes = refRR === 0 ? `= 0` : refRR > 0 ? `> 0` : '= -1',
      sql = `SELECT id, cardLevel, nextReviewDayCount, reviewDates, referenceDayCount, reviewResult FROM test WHERE reviewResult = ${mysql.escape(options.reviewResult)}`;

  if(options.userId) sql += ` and userId = ${options.userId}`;

  connection.query(sql, (err, results) => {
    if (err) throw err;
    cb(err, results);
  });
  logDao(sql);
}

module.exports = {
  addCard, getCards, updateCard, updateCardReviewResult, getCardsForUpdate,
  getLogin, updateUserLoginInfo,
  getOauth, insertOauth, updateOauthLoginInfo
}

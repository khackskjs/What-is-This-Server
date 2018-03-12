const mysql = require('mysql'),
      CARD_TBL = 'test',
      USER_TBL = 'user';

const USER_ID = 'userId', USER_PW = 'userPw', USER_LAST_LOGIN_DATETIME = 'lastLoginDatetime';

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
  console.log(`${sql}`);
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
 * 
 * @param {Object} userInputOption - UserInput 의 멤버 중 WHERE 에 사용하고 싶은 멤버만 파라미터로 전달
 * @param {String} userInputOption.userId?
 */
function getCards(userInputOption, cb) {
  var sql = "SELECT * FROM ?? WHERE ?? = ?",
      options = [CARD_TBL];

  for (var prop in userInputOption) {
    options.push(prop);
    options.push(userInputOption[prop]);
  }

  sql = mysql.format(sql, options);
  connection.query(sql, (err, results, fields) => {
    if (err) throw err;
    cb(err, results, fields);
  });
  logDao(sql);
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
      options = [USER_TBL, USER_ID, userInfo[USER_ID], USER_PW, userInfo[USER_PW]];
  
  sql = mysql.format(sql, options);

  connection.query(sql, (err, results, fields) => {
    if (err) throw err;
    cb(err, results, fields);
  });
  logDao(sql);;
}
function updateUserLastUpdateTime(userInfo, cb) {
  var updateResult, query,
      sql = `UPDATE ${USER_TBL} SET ${USER_LAST_LOGIN_DATETIME} = ?`;

  query = connection.query(sql, [userInfo.lastLoginDatetime], function (err, results, fields) {
    if (err) throw err;
    cb(err, results);
  });
  logDao(sql)
}

function extractObjectToArray(array, object) {
  for(let prop in object) {
    array.push(prop);
    array.push(object[prop]);
  }
  
  return array;
}
module.exports = {
  addCard, getCards, getLogin, updateUserLastUpdateTime
}

const mysql = require('mysql');
const pool = require('./pool');
const OAUTH = require('./constant.json').OAUTH;
/**
 * 
 * @param {String} sql 
 */
function logDao(sql) {
  logger.debug(`${sql};`);
}

/**
 *  email만 이용해서 user 정보 가져 올 것.
 * @param {Object} oauthInfo 
 * @param {string} oauthInfo.email
 */
async function getOauth(oauthInfo) {
  const sql = `SELECT * FROM ?? WHERE ?? = ?`;
  const options = [OAUTH.TABLE_NAME, OAUTH.EMAIL, oauthInfo[OAUTH.EMAIL]];

  const myTask = dbClient => {
    return new Promise((resolve, reject) => {
      const query = dbClient.query(sql, options, (err, results, fields) => {
        if (err) {
          logger.error(`Error:getOauth err[${JSON.stringify(err)}]`);
          return reject(err);
        }
        
        return resolve(results);
      });
      logDao(query.sql);
    });
  }
  
  return pool.use(myTask);
}

async function insertOauth(oauthInfo) {
  const sql = `INSERT INTO ${OAUTH.TABLE_NAME} SET ?`;
  
  const myTask = dbClient => {
    return new Promise((resolve, reject) => {
      dbClient.query(sql, oauthInfo, (err, results) => {
        if (err) {
          logger.error(`Error:insertOauth err[${JSON.stringify(err)}]`);
          return reject(err);
        }

        return resolve(results);
      });

      logDao(query.sql);
    });
  }

  return pool.use(myTask);
}

function updateOauthLoginInfo(oauth) {
  const sql = `UPDATE ${OAUTH.TABLE_NAME} SET ${OAUTH.LAST_LOGIN_DATETIME} = ?, ${OAUTH.REVIEW_DAY_COUNT} = ?`;

  const myTask = dbClient => {
    return new Promise((resolve, reject) => {
      const query = dbClient.query(sql, [oauth.lastLoginDatetime, oauth.reviewDayCount], (err, results, fields) => {
        if (err) return reject(err);
        return resolve(results);
      });
      
     logDao(query.sql)
    });
  }
  
  return pool.use(myTask);
}

module.exports = {
  getOauth, insertOauth, updateOauthLoginInfo
}
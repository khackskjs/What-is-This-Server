const mysql = require('mysql');
const OAUTH = require('./constant.json').OAUTH;
const DB_CONFIG = require('../config.json');

const dbConfig = {
  connectionLimit : 10,
  host     : DB_CONFIG.database.host, //process.env.RDS_HOSTNAME,
  database : DB_CONFIG.database.database,
  user     : DB_CONFIG.database.user,//process.env.RDS_USERNAME,
  password : DB_CONFIG.database.password,//process.env.RDS_PASSWORD,
  port     : DB_CONFIG.database.port//process.env.RDS_PORT
}

var pool  = mysql.createPool(dbConfig);

pool.on('error', (err) => {
  logger.error('[oauth] pool.error', err);
});

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

  return new Promise((resolve, reject) => {
    const query = pool.query(sql, options, (err, results, fields) => {
      if (err) {
        logger.error(`Error:getOauth err[${JSON.stringify(err)}]`);
        return reject(err);
      }
      
      return resolve(results);
    });
    logDao(query.sql);
  });
}

async function insertOauth(oauthInfo) {
  const sql = `INSERT INTO ${OAUTH.TABLE_NAME} SET ?`;
  
  
  return new Promise((resolve, reject) => {
    const query = pool.query(sql, oauthInfo, (err, results) => {
      if (err) {
        logger.error(`Error:insertOauth err[${JSON.stringify(err)}]`);
        return reject(err);
      }

      return resolve(results);
    });

    logDao(query.sql);
  });
}

function updateOauthLoginInfo(oauth) {
  const sql = `UPDATE ${OAUTH.TABLE_NAME} SET ${OAUTH.LAST_LOGIN_DATETIME} = ?, ${OAUTH.REVIEW_DAY_COUNT} = ?`;

  return new Promise((resolve, reject) => {
    const query = pool.query(sql, [oauth.lastLoginDatetime, oauth.reviewDayCount], (err, results, fields) => {
      if (err) return reject(err);
      return resolve(results);
    });
    
    logDao(query.sql)
  });
}

module.exports = {
  getOauth, insertOauth, updateOauthLoginInfo
}
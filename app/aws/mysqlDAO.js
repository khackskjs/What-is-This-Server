const mysql = require('mysql'),
      DB_NAME = 'test';

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
  let query = connection.query(`INSERT INTO ${DB_NAME} SET ?`, userInput, (err, results, fields) => {
    if(err) {
      return console.error(err);
    }
    logDao(`result: ${JSON.stringify(results)}`);
    cb(err, results);
  })
  logDao(`QUERY ${query.sql}`);
}

/**
 * 
 * @param {Object} userInputOption - UserInput 의 멤버 중 WHERE 에 사용하고 싶은 멤버만 파라미터로 전달
 * @param {String} userInputOption.userId?
 */
function getCards(userInputOption, cb) {
  var sql = "SELECT * FROM ?? WHERE ?? = ?",
      options = [DB_NAME];

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

module.exports = {
  addCard, getCards
}

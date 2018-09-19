const genericPool = require('generic-pool');
const Mysql = require('mysql');
const DB_CONFIG = require('../config.json');

const factory = {
  create: (cb) => {
    const config = {
      host     : DB_CONFIG.database.host, //process.env.RDS_HOSTNAME,
      database : DB_CONFIG.database.database,
      user     : DB_CONFIG.database.user,//process.env.RDS_USERNAME,
      password : DB_CONFIG.database.password,//process.env.RDS_PASSWORD,
      port     : DB_CONFIG.database.port//process.env.RDS_PORT
    }

    var connection = Mysql.createConnection(config);
    return new Promise((resolve, reject) => {
      connection.connect(err => {
        if (err) return reject(err);
        else return resolve(connection);
      })  
    });
  },
  destroy: (conn) => {
    return new Promise((resolve, reject) => {
      conn.end((err) => {
        console.log("연결 종료", err); 
        if(err) return reject(err);
        else return resolve();
      });
    });
  }
}

const opts = {
  max: 10,
  min: 3
};

const myPool = genericPool.createPool(factory, opts);

process.on('exit', (code) => {
  console.log('process.on:exit')
  myPool.drain(() => {
    myPool.destroy();
  })
})

process.on('uncaughtException', (err) => {
  console.log("오류", err);
});

module.exports = myPool;
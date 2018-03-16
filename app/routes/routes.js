var mysqlDao = require('../aws/mysqlDAO'),
    cardService = require('../service/cardService'),
    userService = require('../service/userService');

module.exports = function(app, db) {
  app.use('/', (req, res, next) => {
    let m = req.method;
    console.log(`>>> ${m} ${req.path}`, m === 'GET' ? req.query : req.body);
    next();
  });

  app.post('/card', (req, res) => {
    mysqlDao.addCard(req.body, (err, result) => {
      res.json(result);
    });
  })
  
  app.get('/card', (req, res) => {
    mysqlDao.getCards(req.query, (err, results, fields) => {
      console.log(`  results.length: ${results.length}`);
      res.json(results);
    });
  });

  app.put('/card', (req, res) => {
    mysqlDao.updateCard(req.body, (err, result) => {
      res.send({ result: 'success'});
    })
  })

  app.get('/card/update', (req, res) => {
    res.json('OK');
  });

  app.post('/card/update', (req, res) => {
    cardService.updateReviewResult(req.body, (err, result) => {
      console.log(result);
    });
  });
  
  app.post('/user/login', (req, res) => {    
    var userInfoReq = req.body;
    userInfoReq.lastLoginDatetime = userInfoReq.lastLoginDatetime || new Date(userInfoReq.lastLoginDatetime);
    
    userService.login(userInfoReq, res);
  });
};
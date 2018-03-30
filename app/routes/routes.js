var mysqlDao = require('../aws/mysqlDAO'),
    cardService = require('../service/cardService'),
    userService = require('../service/userService'),
    oauthService = require('../service/oauthService');

module.exports = function(app, db) {
  app.use('/', (req, res, next) => {
    let m = req.method;
    console.log(`\n>>> ${m} ${req.path}`, m === 'GET' ? req.query : req.body);
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

  app.post('/card/update', (req, res) => {
    cardService.updateReviewResult(req.body, (err, result) => {
      if(err) {
        console.error(`${req.method} ${req.path} fail`);
        return res.json('fail');
      }
      return res.json({ result: 'success' });
    });
  });
  
  app.post('/user/login', (req, res) => {    
    var userInfoReq = req.body;
    userInfoReq.lastLoginDatetime = userInfoReq.lastLoginDatetime || new Date(userInfoReq.lastLoginDatetime);
    
    userService.login(userInfoReq, res);
  });

  app.post('/oauth/login', (req, res) => {
    var oauthInfoReq = req.body;
    oauthInfoReq.lastLoginDatetime = new Date();
    oauthService.login(oauthInfoReq, res);
  });
};
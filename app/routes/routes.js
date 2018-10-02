var mysqlDao = require('../aws/mysqlDAO'),
    cardService = require('../service/cardService'),
    userService = require('../service/userService'),
    oauthService = require('../service/oauthService');

module.exports = function(app) {
  app.use('/', (req, res, next) => {
    let m = req.method;
    logger.debug(`\n>>> ${m} ${req.path}`, m === 'GET' ? req.query : req.body);
    // logger.debug(req.session);
    
  //   if(req.session.page_views){
  //     req.session.page_views++;
  //     res.send("You visited this page " + req.session.page_views + " times");
  //  } else {
  //     req.session.page_views = 1;
  //     res.send("Welcome to this page for the first time!");
  //  }

    
    next();
  });

  app.post('/card', (req, res) => {
    mysqlDao.addCard(req.body, (err, result) => {
      res.json(result);
    });
  })
  
  app.get('/card', async (req, res) => {
    try {
      const cards = await mysqlDao.getCards(req.query);
      res.json(cards);
    }
    catch(err) {
      logger.error(`GET /card err`, err);
    }
  });

  app.put('/card', (req, res) => {
    mysqlDao.updateCard(req.body, (err, result) => {
      res.send({ result: 'success'});
    })
  })

  app.post('/card/update', (req, res) => {
    cardService.updateReviewResult(req.body, (err, result) => {
      if(err) {
        logger.error(`${req.method} ${req.path} fail`);
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
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

  app.post('/user/login', (req, res) => {
    console.log('>>> POST', req.body);
  });
};
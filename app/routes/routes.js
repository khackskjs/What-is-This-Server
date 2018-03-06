mysqlDao = require('../aws/mysqlDAO');

module.exports = function(app, db) {
  app.post('/notes', (req, res) => {
    console.log(req.body);
    // You'll create your note here.
    res.send('Hello')
  });

  app.post('/card', (req, res) => {
    console.log('>>> POST', req.body);
    mysqlDao.addCard(req.body);
    res.send('OK');
  })
  
  app.get('/card', (req, res) => {
    console.log('>>> GET', req.query);
    
    mysqlDao.getCards(req.query, (err, results, fields) => {
      console.log(`  results.length: ${results.length}`);
      console.log(`  fields.length: ${fields.length}`);
      res.json(results);
    });
  })
};
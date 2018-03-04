const express         = require('express'),
      bodyParser      = require('body-parser'),
      cors            = require('cors'),
      app             = express(),
      port            = 8000;

require('./app/aws/mysqlDAO');

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

require('./app/routes')(app, {});

app.listen(port, () => {
  console.log('We are live on ' + port);
});
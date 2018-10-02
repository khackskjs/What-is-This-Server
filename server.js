const express         = require('express'),
      session         = require('express-session'),
      bodyParser      = require('body-parser'),
      cors            = require('cors'),
      app             = express(),
      port            = 8000;

global.logger = require('./app/common/logger');

require('./app/aws/mysqlDAO');

// app.use(session({secret: "Shh, its a secret!"}));
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

require('./app/routes')(app, {});

app.listen(port, () => {
  logger.info(`What's that server started with ${port}`);
});
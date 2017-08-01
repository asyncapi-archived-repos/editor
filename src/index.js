const path = require('path');
const bodyParser = require('body-parser');
const docs = require('asyncapi-docgen');
const express = require('express');
const config = require('./lib/config');
const app = express();

app.use(bodyParser.text({ type: 'text/plain' }));
app.use(express.static(path.resolve(__dirname, '../public')));

app.post('/code', async (req, res, next) => {
  let html;

  try {
    html = await docs.generate(req.body);
  } catch (e) {
    return res.status(422).send({
      code: 'incorrect-format',
      message: e.message,
      errors: Array.isArray(e) ? e : null
    });
  }

  res.send(html);
});

app.use((err, req, res, next) => {
  res.status(500).send(err);
});

app.listen(config.api.port);

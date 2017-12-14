const path = require('path');
const bodyParser = require('body-parser');
const docs = require('asyncapi-docgen');
const express = require('express');
const archiver = require('archiver');
const config = require('./lib/config');
const app = express();

app.use(bodyParser.text({ type: 'text/plain' }));
app.use(bodyParser.urlencoded({ extended: true }));
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

app.post('/generate/docs', async (req, res, next) => {
  const archive = archiver('zip');
  res.attachment('asyncapi.zip');
  archive.pipe(res);

  archive.append(req.body.data, { name: 'asyncapi.yml' });
  let html;

  try {
    html = await docs.generateFullHTML(req.body.data);
  } catch (e) {
    return res.status(422).send({
      code: 'incorrect-format',
      message: e.message,
      errors: Array.isArray(e) ? e : null
    });
  }
  archive.append(html, { name: 'index.html' });

  const css = await docs.getCSS();
  archive.append(css, { name: 'css/main.css' });

  archive.finalize();
});

app.use((err, req, res, next) => {
  res.status(500).send(err);
});

app.listen(config.api.port);

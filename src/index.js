const path = require('path');
const bodyParser = require('body-parser');
const generator = require('asyncapi-generator');
const express = require('express');
const archiver = require('archiver');
const YAML = require('js-yaml');
const config = require('./lib/config');
const app = express();

app.use(bodyParser.text({ type: 'text/plain' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../public')));

app.post('/code', async (req, res, next) => {
  let html;

  try {
    let asyncapiObj;

    try {
      asyncapiObj = JSON.parse(req.body);
    } catch (er) {
      asyncapiObj = YAML.safeLoad(req.body);
    }

    html = await generator.generateTemplateFile({
      template: 'html',
      file: '.partials/content.html',
      config: {
        asyncapi: asyncapiObj,
      }
    });
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
    let asyncapiObj;

    try {
      asyncapiObj = JSON.parse(req.body.data);
    } catch (er) {
      asyncapiObj = YAML.safeLoad(req.body.data);
    }

    html = await generator.generateTemplateFile({
      template: 'html',
      file: 'index.html',
      config: {
        asyncapi: asyncapiObj,
      }
    });
  } catch (e) {
    return res.status(422).send({
      code: 'incorrect-format',
      message: e.message,
      errors: Array.isArray(e) ? e : null
    });
  }
  archive.append(html, { name: 'index.html' });

  try {
    const css = await generator.getTemplateFile({
      template: 'html',
      file: 'css/main.css',
    });
    archive.append(css, { name: 'css/main.css' });

    archive.finalize();
  } catch (e) {
    return res.status(500).send({
      code: 'server-error',
      message: e.message,
      errors: e
    });
  }
});

app.use((err, req, res, next) => {
  res.status(500).send(err);
});

app.listen(config.api.port);

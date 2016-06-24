const express = require('express');
const path = require('path');

const PORT = 1337;
const PATHS = {
  app: path.join(__dirname, 'www')
};

const app = express();

app.use(express.static(PATHS.app));

app.get('/', function response(req, res) {
  res.sendFile(path.join(PATHS.app, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==> Listening on port: ${PORT}`);
});

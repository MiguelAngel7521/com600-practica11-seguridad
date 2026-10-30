require('dotenv').config({ quiet: true });
const fs = require('node:fs');
const https = require('node:https');
const app = require('./app');
const puerto = Number(process.env.TLS_PORT || 3443);
https.createServer({
  key: fs.readFileSync('certs/servidor.key'),
  cert: fs.readFileSync('certs/servidor.crt'),
  minVersion: 'TLSv1.2'
}, app).listen(puerto, process.env.HOST || '127.0.0.1', () => {
  console.log(`API de tareas HTTPS escuchando en https://localhost:${puerto}`);
});

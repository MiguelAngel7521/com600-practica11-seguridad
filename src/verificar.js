require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const { SECRETO, EMISOR, AUDIENCIA } = require('./config');
try {
  console.log('VALIDO:', jwt.verify(process.argv[2], SECRETO, {
    algorithms: ['HS256'], issuer: EMISOR, audience: AUDIENCIA
  }));
} catch (e) {
  console.log('RECHAZADO:', e.name, '-', e.message);
  process.exitCode = 1;
}

// Emisor administrativo de laboratorio: no se expone como endpoint público.
require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const { SECRETO, EMISOR, AUDIENCIA } = require('./config');
const rol = process.argv[2] || 'usuario';
if (!['usuario', 'admin'].includes(rol)) throw new Error('rol desconocido');
console.log(jwt.sign({ sub: rol === 'admin' ? 'u-001' : 'u-100', nombre: 'Ana Quispe', rol },
  SECRETO, { algorithm: 'HS256', expiresIn: '15m', issuer: EMISOR, audience: AUDIENCIA }));

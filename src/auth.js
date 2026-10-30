const jwt = require('jsonwebtoken');
const { SECRETO, EMISOR, AUDIENCIA } = require('./config');

function autenticar(req, res, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({ error: 'falta el token' });
  try {
    req.usuario = jwt.verify(match[1], SECRETO, {
      algorithms: ['HS256'], issuer: EMISOR, audience: AUDIENCIA
    });
    if (typeof req.usuario.sub !== 'string' || !req.usuario.sub ||
        !Number.isFinite(req.usuario.exp) ||
        !['usuario', 'admin'].includes(req.usuario.rol)) {
      return res.status(401).json({ error: 'claims obligatorios inválidos' });
    }
    return next();
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
}

function exigirRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: 'no autenticado' });
    if (!roles.includes(req.usuario.rol)) return res.status(403).json({ error: 'rol insuficiente' });
    return next();
  };
}
module.exports = { autenticar, exigirRol };

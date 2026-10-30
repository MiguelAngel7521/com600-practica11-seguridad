const SECRETO = process.env.JWT_SECRET;
if (!SECRETO || SECRETO.length < 32) {
  throw new Error('JWT_SECRET es obligatorio y debe tener al menos 32 caracteres');
}
module.exports = { SECRETO, EMISOR: 'practica11', AUDIENCIA: 'api-tareas' };

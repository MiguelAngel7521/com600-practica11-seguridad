const request = require('supertest');
const jwt = require('jsonwebtoken');
const { crearApp } = require('../src/app');
const { SECRETO, EMISOR, AUDIENCIA } = require('../src/config');
const { exigirRol } = require('../src/auth');
function token(rol = 'usuario', opciones = {}, clave = SECRETO, claims = {}) {
  return jwt.sign({ sub: 'u-100', rol, ...claims }, clave,
    { expiresIn: '15m', issuer: EMISOR, audience: AUDIENCIA, ...opciones });
}
let app;
beforeEach(() => { app = crearApp(); });
test('salud es pública', async () => {
  expect((await request(app).get('/salud')).status).toBe(200);
});
test.each(['get', 'post', 'delete'])('%s /tareas exige identidad', async metodo => {
  const ruta = metodo === 'delete' ? '/tareas/1' : '/tareas';
  expect((await request(app)[metodo](ruta).send({ titulo: 'Sin permiso' })).status).toBe(401);
});
test.each(['Basic abc', 'Bearer', 'Bearer abc extra'])('rechaza cabecera %s', async authorization => {
  expect((await request(app).get('/tareas').set('Authorization', authorization)).status).toBe(401);
});
test.each([
  ['vencido', () => token('usuario', { expiresIn: '-10m' }), 'jwt expired'],
  ['otra firma', () => token('usuario', {}, 'otra-clave-de-pruebas-invalida-xxxxxxxx'), 'invalid signature'],
  ['otro emisor', () => token('usuario', { issuer: 'otro' }), 'issuer'],
  ['otra audiencia', () => token('usuario', { audience: 'otro' }), 'audience'],
  ['otro algoritmo', () => token('usuario', { algorithm: 'HS384' }), 'invalid algorithm'],
  ['sin exp', () => jwt.sign({ sub: 'u', rol: 'usuario', iss: EMISOR, aud: AUDIENCIA }, SECRETO), 'claims'],
  ['sin sujeto válido', () => token('usuario', {}, SECRETO, { sub: '' }), 'claims'],
  ['rol desconocido', () => token('superusuario'), 'claims']
])('401 para %s', async (_caso, emitir, error) => {
  const r = await request(app).get('/tareas').set('Authorization', `Bearer ${emitir()}`);
  expect(r.status).toBe(401); expect(r.body.error).toContain(error);
});
test('alterar el rol sin volver a firmar produce 401', async () => {
  const partes = token().split('.');
  const carga = JSON.parse(Buffer.from(partes[1], 'base64url').toString());
  carga.rol = 'admin'; partes[1] = Buffer.from(JSON.stringify(carga)).toString('base64url');
  const r = await request(app).delete('/tareas/1').set('Authorization', `Bearer ${partes.join('.')}`);
  expect(r.status).toBe(401); expect(r.body.error).toBe('invalid signature');
});
test.each(['usuario', 'admin'])('%s puede leer y crear', async rol => {
  const cab = `Bearer ${token(rol)}`;
  expect((await request(app).post('/tareas').set('Authorization', cab).send({ titulo: 'Prueba' })).status).toBe(201);
  expect((await request(app).get('/tareas').set('Authorization', cab)).status).toBe(200);
});
test('usuario recibe 403 y admin recibe 204 en la misma tarea', async () => {
  const user = `Bearer ${token()}`, admin = `Bearer ${token('admin')}`;
  await request(app).post('/tareas').set('Authorization', user).send({ titulo: 'Borrar' });
  expect((await request(app).delete('/tareas/1').set('Authorization', user)).status).toBe(403);
  expect((await request(app).get('/tareas').set('Authorization', user)).body).toHaveLength(1);
  expect((await request(app).delete('/tareas/1').set('Authorization', admin)).status).toBe(204);
  expect((await request(app).get('/tareas').set('Authorization', user)).body).toEqual([]);
  expect((await request(app).delete('/tareas/1').set('Authorization', admin)).status).toBe(404);
});
test('identificadores no se reutilizan después de borrar', async () => {
  const cab = `Bearer ${token('admin')}`;
  await request(app).post('/tareas').set('Authorization', cab).send({ titulo: 'Uno' });
  await request(app).delete('/tareas/1').set('Authorization', cab);
  const r = await request(app).post('/tareas').set('Authorization', cab).send({ titulo: 'Dos', rol: 'admin' });
  expect(r.body.id).toBe(2); expect(r.body).not.toHaveProperty('rol');
});
test('el control de roles sin autenticación previa falla con 401', () => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }, next = jest.fn();
  exigirRol('admin')({}, res, next);
  expect(res.status).toHaveBeenCalledWith(401); expect(next).not.toHaveBeenCalled();
});

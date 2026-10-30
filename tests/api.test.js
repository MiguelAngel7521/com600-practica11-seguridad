const request = require('supertest');
const { crearApp } = require('../src/app');
const jwt = require('jsonwebtoken');
const { SECRETO, EMISOR, AUDIENCIA } = require('../src/config');
const token = jwt.sign({ sub: 'u-100', rol: 'usuario' }, SECRETO,
  { expiresIn: '15m', issuer: EMISOR, audience: AUDIENCIA });
let app;
beforeEach(() => { app = crearApp(); });

test('POST /tareas crea la tarea y responde 201', async () => {
  const entrada = { titulo: 'Estudiar' }; // preparar
  const respuesta = await request(app).post('/tareas').set('Authorization', `Bearer ${token}`).send(entrada); // ejecutar
  expect(respuesta.status).toBe(201); // verificar
  expect(respuesta.body).toEqual({ titulo: 'Estudiar', id: 1, completada: false });
});

test('POST /tareas sin título responde 400 y no crea nada', async () => {
  const antes = await request(app).get('/tareas').set('Authorization', `Bearer ${token}`); // preparar
  const respuesta = await request(app).post('/tareas').set('Authorization', `Bearer ${token}`).send({}); // ejecutar
  const despues = await request(app).get('/tareas').set('Authorization', `Bearer ${token}`);
  expect(respuesta.status).toBe(400); // verificar
  expect(respuesta.body.error).toMatch(/titulo/);
  expect(despues.body).toEqual(antes.body);
});

test('GET /tareas devuelve las tareas creadas con su estado calculado', async () => {
  await request(app).post('/tareas').set('Authorization', `Bearer ${token}`).send({ titulo: 'Primera' }); // preparar
  await request(app).post('/tareas').set('Authorization', `Bearer ${token}`).send({ titulo: 'Segunda', vence: '2000-01-01' });
  const respuesta = await request(app).get('/tareas').set('Authorization', `Bearer ${token}`); // ejecutar
  expect(respuesta.status).toBe(200); // verificar
  expect(respuesta.body).toEqual([
    { id: 1, titulo: 'Primera', completada: false, estado: 'PENDIENTE' },
    { id: 2, titulo: 'Segunda', vence: '2000-01-01', completada: false, estado: 'ATRASADA' }
  ]);
});

test.each(['', '   ', 123, null])('rechaza un título inválido %s sin guardar tareas', async titulo => {
  const entrada = { titulo }; // preparar
  const respuesta = await request(app).post('/tareas').set('Authorization', `Bearer ${token}`).send(entrada); // ejecutar
  expect(respuesta.status).toBe(400); // verificar
  expect((await request(app).get('/tareas').set('Authorization', `Bearer ${token}`)).body).toEqual([]);
});

test('rechaza una petición sin cuerpo sin producir error interno', async () => {
  const respuesta = await request(app).post('/tareas').set('Authorization', `Bearer ${token}`); // ejecutar
  expect(respuesta.status).toBe(400); // verificar
  expect(respuesta.body.error).toBe('titulo es obligatorio');
});

test('asigna identificadores propios y fuerza completada a false al crear', async () => {
  const entrada = { titulo: '  Nueva  ', id: 999, completada: true }; // preparar
  const respuesta = await request(app).post('/tareas').set('Authorization', `Bearer ${token}`).send(entrada); // ejecutar
  expect(respuesta.status).toBe(201); // verificar
  expect(respuesta.body).toEqual({ titulo: 'Nueva', id: 1, completada: false });
});

test('cada aplicación comienza con una lista vacía', async () => {
  const respuesta = await request(app).get('/tareas').set('Authorization', `Bearer ${token}`); // ejecutar, beforeEach prepara
  expect(respuesta.body).toEqual([]); // verificar
});

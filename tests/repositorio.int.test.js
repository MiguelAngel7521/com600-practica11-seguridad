const { MongoDBContainer } = require('@testcontainers/mongodb');
const { ObjectId } = require('mongodb');
const { crearRepositorio } = require('../src/repositorio');
let contenedor, repo;

beforeAll(async () => {
  contenedor = await new MongoDBContainer('mongo:7')
    .withLabels({ practica7: 'true' }).start();
  const uri = new URL(contenedor.getConnectionString());
  uri.searchParams.set('directConnection', 'true');
  repo = await crearRepositorio(uri.toString());
  if (process.env.EVIDENCIA_CONTENEDOR === '1') {
    console.log('MONGO_EVIDENCIA_LISTO', contenedor.getId());
    // Solo para observar docker ps; no demora las ejecuciones normales.
    await new Promise(resolve => setTimeout(resolve, 3500));
  }
}, 120000);

beforeEach(async () => { await repo.limpiar(); });
afterAll(async () => {
  try { await repo?.cerrar(); }
  finally { await contenedor?.stop(); }
}, 30000);

test('guarda una tarea y la recupera por título', async () => {
  const tarea = { titulo: 'Leer Newman', completada: false }; // preparar
  const guardada = await repo.guardar(tarea); // ejecutar
  const encontrada = await repo.buscarPorTitulo(tarea.titulo);
  expect(guardada.acknowledged).toBe(true); // verificar
  expect(encontrada).toEqual({ ...tarea, _id: guardada.insertedId });
  expect(tarea).not.toHaveProperty('_id');
});

test('busca por el título exacto entre varias tareas', async () => {
  await repo.guardar({ titulo: 'Primera', completada: false }); // preparar
  await repo.guardar({ titulo: 'Segunda', completada: true });
  const encontrada = await repo.buscarPorTitulo('Segunda'); // ejecutar
  expect(encontrada).toMatchObject({ titulo: 'Segunda', completada: true }); // verificar
});

test('actualiza el estado y conserva el título de la tarea', async () => {
  const { insertedId } = await repo.guardar({ titulo: 'Actualizar', completada: false }); // preparar
  const resultado = await repo.actualizarEstado(insertedId, true); // ejecutar
  expect(resultado.matchedCount).toBe(1); // verificar
  expect(resultado.modifiedCount).toBe(1);
  expect(await repo.buscarPorTitulo('Actualizar')).toMatchObject({ titulo: 'Actualizar', completada: true });
});

test('elimina una tarea sin borrar otra existente', async () => {
  const { insertedId } = await repo.guardar({ titulo: 'Eliminar' }); // preparar
  await repo.guardar({ titulo: 'Conservar' });
  const resultado = await repo.eliminar(insertedId); // ejecutar
  expect(resultado.deletedCount).toBe(1); // verificar
  expect(await repo.buscarPorTitulo('Eliminar')).toBeNull();
  expect(await repo.buscarPorTitulo('Conservar')).not.toBeNull();
  expect(await repo.contar()).toBe(1);
});

test('buscar un documento inexistente devuelve null', async () => {
  const titulo = 'No existe'; // preparar
  const encontrada = await repo.buscarPorTitulo(titulo); // ejecutar
  expect(encontrada).toBeNull(); // verificar
});

test('actualizar un identificador inexistente no inserta documentos', async () => {
  const id = new ObjectId(); // preparar
  const resultado = await repo.actualizarEstado(id, true); // ejecutar
  expect(resultado.matchedCount).toBe(0); // verificar
  expect(resultado.modifiedCount).toBe(0);
  expect(await repo.contar()).toBe(0);
});

test('eliminar un identificador inexistente devuelve cero eliminados', async () => {
  const id = new ObjectId(); // preparar
  const resultado = await repo.eliminar(id); // ejecutar
  expect(resultado.deletedCount).toBe(0); // verificar
});

test('cada caso comienza con la colección vacía', async () => {
  const cantidad = await repo.contar(); // ejecutar, beforeEach prepara
  expect(cantidad).toBe(0); // verificar
});

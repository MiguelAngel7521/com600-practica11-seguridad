const contrato = require('../src/tarea-creada.contrato.json');
const { construirEventoTareaCreada } = require('../src/eventos');

test('el evento publicado cumple el contrato TareaCreada 1.0', () => {
  const tarea = { id: 1, titulo: 'Estudiar' }; // preparar
  const evento = construirEventoTareaCreada(tarea); // ejecutar
  for (const campo of contrato.camposObligatorios) { // verificar
    expect(evento).toHaveProperty(campo);
    expect(typeof evento[campo]).toBe(contrato.tipos[campo]);
  }
  expect(evento.id).toBe(tarea.id);
  expect(evento.titulo).toBe(tarea.titulo);
  expect(new Date(evento.creadaEn).toISOString()).toBe(evento.creadaEn);
});

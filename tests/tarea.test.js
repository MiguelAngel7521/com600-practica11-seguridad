const { estadoDeTarea } = require('../src/tarea');

describe('estadoDeTarea', () => {
  test('devuelve COMPLETADA cuando la tarea está terminada', () => {
    const tarea = { titulo: 'Entregar informe', completada: true }; // preparar
    const estado = estadoDeTarea(tarea); // ejecutar
    expect(estado).toBe('COMPLETADA'); // verificar
  });
});

 test('devuelve ATRASADA cuando venció y no está completada', () => {
   const tarea = { titulo: 'Pagar servidor', vence: '2026-01-10' };
   const estado = estadoDeTarea(tarea, new Date('2026-01-11'));
   expect(estado).toBe('ATRASADA');
 });
 test('una tarea completada nunca figura como atrasada', () => {
   const tarea = { titulo: 'Pagar servidor', vence: '2026-01-10', completada: true };
   const estado = estadoDeTarea(tarea, new Date('2026-06-01'));
   expect(estado).toBe('COMPLETADA');
 });
 test('lanza un error si la tarea no tiene título', () => {
   const ejecutar = () => estadoDeTarea({});
   expect(ejecutar).toThrow('La tarea necesita un título');
 });

 test('sigue PENDIENTE exactamente en el instante del vencimiento', () => {
   const ahora = new Date('2026-01-10T12:00:00.000Z');
   const tarea = { titulo: 'Entregar', vence: ahora.toISOString() };
   const estado = estadoDeTarea(tarea, ahora);
   expect(estado).toBe('PENDIENTE');
 });

test('rechaza una tarea nula con el mismo error de validación', () => {
  const tarea = null; // preparar
  const ejecutar = () => estadoDeTarea(tarea); // ejecutar al verificar
  expect(ejecutar).toThrow('La tarea necesita un título'); // verificar
});

test('devuelve PENDIENTE cuando la tarea no tiene vencimiento', () => {
  const tarea = { titulo: 'Sin fecha' }; // preparar
  const estado = estadoDeTarea(tarea, new Date('2026-01-11')); // ejecutar
  expect(estado).toBe('PENDIENTE'); // verificar
});

test('devuelve PENDIENTE antes de llegar a la fecha de vencimiento', () => {
  const tarea = { titulo: 'Preparar', vence: '2026-01-12' }; // preparar
  const estado = estadoDeTarea(tarea, new Date('2026-01-11')); // ejecutar
  expect(estado).toBe('PENDIENTE'); // verificar
});

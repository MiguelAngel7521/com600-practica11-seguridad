const { calcularTotal } = require('../src/total');

test('rechaza un descuento del 150% para impedir un total negativo', () => {
  const items = [{ precio: 100, cantidad: 2 }]; // preparar
  const ejecutar = () => calcularTotal(items, 150); // ejecutar al verificar
  expect(ejecutar).toThrow('El descuento debe estar entre 0 y 100'); // verificar
});

test.each([
  ['sin descuento', [{ precio: 50, cantidad: 2 }], 0, 100],
  ['con descuento del 25%', [{ precio: 50, cantidad: 2 }], 25, 75],
  ['con descuento del 100%', [{ precio: 50, cantidad: 2 }], 100, 0],
  ['con carrito vacío', [], 25, 0],
  ['con varios productos', [{ precio: 20, cantidad: 3 }, { precio: 40, cantidad: 1 }], 10, 90]
])('calcula el importe %s', (_nombre, items, descuento, esperado) => {
  // preparar: datos de la tabla
  const total = calcularTotal(items, descuento); // ejecutar
  expect(total).toBe(esperado); // verificar
});

test.each([-1, NaN, Infinity, '10'])('rechaza el descuento inválido %s', descuento => {
  const items = [{ precio: 100, cantidad: 1 }]; // preparar
  const ejecutar = () => calcularTotal(items, descuento); // ejecutar al verificar
  expect(ejecutar).toThrow('El descuento debe estar entre 0 y 100'); // verificar
});

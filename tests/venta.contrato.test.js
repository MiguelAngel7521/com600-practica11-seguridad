const contrato = require('../src/venta-confirmada.contrato.json');
const { construirVentaConfirmada } = require('../src/ventas');
const { procesarVentaConfirmada } = require('../src/consumidor');

// Ejemplo acordado independiente de la implementación del proveedor.
const venta = Object.freeze({
  id: 'VEN-001', cliente: 'Miguel', producto: 'Cuaderno', cantidad: 2,
  total: 30, estado: 'confirmada', fecha: '2026-10-08T12:00:00.000Z'
});
const mensaje = Object.freeze({ ...venta, tipo: 'VentaConfirmada', version: 1 });

test('proveedor Ventas publica los campos y tipos de VentaConfirmada v1', () => {
  const entrada = { ...venta }; // preparar
  const evento = construirVentaConfirmada(entrada); // ejecutar
  for (const campo of contrato.camposObligatorios) { // verificar
    expect(evento).toHaveProperty(campo);
    expect(typeof evento[campo]).toBe(contrato.tipos[campo]);
  }
  expect(evento).toEqual(mensaje);
  expect(entrada).toEqual(venta);
});

test('consumidor Inventario procesa el mensaje acordado y descuenta unidades', () => {
  const stock = 10; // preparar
  const resultado = procesarVentaConfirmada(mensaje, stock); // ejecutar
  expect(resultado).toEqual({ eventoId: 'VEN-001', producto: 'Cuaderno', stock: 8 }); // verificar
});

test('la prueba de contrato detecta el cambio cantidad -> unidades', () => {
  const { cantidad, ...resto } = mensaje; // preparar
  const roto = { ...resto, unidades: cantidad };
  const ejecutar = () => procesarVentaConfirmada(roto, 10); // ejecutar al verificar
  expect(ejecutar).toThrow('campo cantidad'); // verificar
});

test.each([
  ['version', 2, 'version no compatible'],
  ['tipo', 'VentaAnulada', 'tipo no compatible'],
  ['estado', 'anulada', 'estado no compatible'],
  ['cliente', ' ', 'no pueden estar vacíos'],
  ['id', '', 'no pueden estar vacíos'],
  ['producto', '', 'no pueden estar vacíos'],
  ['cantidad', 0, 'cantidad debe ser un entero positivo'],
  ['cantidad', 1.5, 'cantidad debe ser un entero positivo'],
  ['total', -1, 'total debe ser positivo'],
  ['total', Infinity, 'total debe ser positivo'],
  ['fecha', 'no es fecha', 'fecha debe ser ISO 8601 UTC'],
  ['fecha', '2026-10-08', 'fecha debe ser ISO 8601 UTC'],
  ['cantidad', '2', 'campo cantidad']
])('rechaza %s=%s con un error descriptivo', (campo, valor, error) => {
  const evento = { ...mensaje, [campo]: valor }; // preparar
  const ejecutar = () => procesarVentaConfirmada(evento, 10); // ejecutar al verificar
  expect(ejecutar).toThrow(error); // verificar
});

test.each([null, 'VentaConfirmada'])('rechaza el evento inválido %s', evento => {
  const stock = 10; // preparar
  const ejecutar = () => procesarVentaConfirmada(evento, stock); // ejecutar al verificar
  expect(ejecutar).toThrow('Evento inválido'); // verificar
});

test('rechaza una venta válida cuyo pedido supera el stock', () => {
  const stock = 1; // preparar
  const ejecutar = () => procesarVentaConfirmada(mensaje, stock); // ejecutar al verificar
  expect(ejecutar).toThrow('Stock insuficiente'); // verificar
});

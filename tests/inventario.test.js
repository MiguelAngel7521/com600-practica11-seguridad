const { reservarStock } = require('../src/inventario');

describe('reservarStock: regla del servicio Inventario', () => {
  test('descuenta las unidades vendidas del stock disponible', () => {
    const stock = 10, cantidad = 3; // preparar
    const restante = reservarStock(stock, cantidad); // ejecutar
    expect(restante).toBe(7); // verificar
  });
  test('permite vender exactamente todo el stock y devuelve cero', () => {
    const stock = 3, cantidad = 3; // preparar: borde superior
    const restante = reservarStock(stock, cantidad); // ejecutar
    expect(restante).toBe(0); // verificar
  });
  test('permite vender la última unidad disponible', () => {
    const stock = 1, cantidad = 1; // preparar: borde mínimo
    const restante = reservarStock(stock, cantidad); // ejecutar
    expect(restante).toBe(0); // verificar
  });
  test('rechaza una venta cuando el stock ya está en cero', () => {
    const stock = 0, cantidad = 1; // preparar: borde sin existencias
    const ejecutar = () => reservarStock(stock, cantidad); // ejecutar al verificar
    expect(ejecutar).toThrow('Stock insuficiente'); // verificar
  });
  test('rechaza vender más unidades de las disponibles', () => {
    const stock = 5, cantidad = 6; // preparar: error de negocio
    const ejecutar = () => reservarStock(stock, cantidad); // ejecutar al verificar
    expect(ejecutar).toThrow('Stock insuficiente'); // verificar
  });
  test('rechaza una cantidad negativa', () => {
    const stock = 5, cantidad = -1; // preparar: error de entrada
    const ejecutar = () => reservarStock(stock, cantidad); // ejecutar al verificar
    expect(ejecutar).toThrow('cantidad debe ser un entero positivo'); // verificar
  });
});

describe('validación de entradas de Inventario', () => {
  test.each([-1, 1.5, NaN, Infinity, '10'])('rechaza stock inválido: %s', stock => {
    const cantidad = 1; // preparar
    const ejecutar = () => reservarStock(stock, cantidad); // ejecutar al verificar
    expect(ejecutar).toThrow('stock debe ser un entero no negativo'); // verificar
  });
  test.each([0, 0.5, NaN, Infinity, '2'])('rechaza cantidad inválida: %s', cantidad => {
    const stock = 10; // preparar
    const ejecutar = () => reservarStock(stock, cantidad); // ejecutar al verificar
    expect(ejecutar).toThrow('cantidad debe ser un entero positivo'); // verificar
  });
});

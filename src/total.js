function calcularTotal(items, descuentoPorcentaje) {
  if (!Number.isFinite(descuentoPorcentaje) || descuentoPorcentaje < 0 || descuentoPorcentaje > 100) {
    throw new Error('El descuento debe estar entre 0 y 100');
  }
  const bruto = items.reduce((a, i) => a + i.precio * i.cantidad, 0);
  return bruto - (bruto * descuentoPorcentaje / 100);
}
module.exports = { calcularTotal };

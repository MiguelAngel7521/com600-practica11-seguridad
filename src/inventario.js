// Regla pura del servicio Inventario de la tienda: reservar unidades sin sobregiro.
function reservarStock(stock, cantidad) {
  if (!Number.isSafeInteger(stock) || stock < 0) {
    throw new Error('stock debe ser un entero no negativo');
  }
  if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
    throw new Error('cantidad debe ser un entero positivo');
  }
  if (cantidad > stock) throw new Error('Stock insuficiente');
  return stock - cantidad;
}
module.exports = { reservarStock };

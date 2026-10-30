// Mismo mensaje Ventas -> Inventario utilizado por la tienda de la Práctica 6.
function construirVentaConfirmada(venta) {
  return {
    id: venta.id,
    cliente: venta.cliente,
    producto: venta.producto,
    cantidad: venta.cantidad,
    total: venta.total,
    estado: 'confirmada',
    fecha: venta.fecha,
    tipo: 'VentaConfirmada',
    version: 1
  };
}
module.exports = { construirVentaConfirmada };

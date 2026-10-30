const contrato = require('./venta-confirmada.contrato.json');
const { reservarStock } = require('./inventario');

function procesarVentaConfirmada(evento, stock) {
  if (!evento || typeof evento !== 'object') throw new Error('Evento inválido');
  for (const campo of contrato.camposObligatorios) {
    if (typeof evento[campo] !== contrato.tipos[campo]) {
      throw new Error(`Contrato: falta o es inválido el campo ${campo}`);
    }
  }
  for (const [campo, valor] of Object.entries(contrato.valores)) {
    if (evento[campo] !== valor) throw new Error(`Contrato: ${campo} no compatible`);
  }
  if (!['id', 'cliente', 'producto'].every(campo => evento[campo].trim())) {
    throw new Error('Contrato: id, cliente y producto no pueden estar vacíos');
  }
  if (!Number.isFinite(evento.total) || evento.total <= 0) throw new Error('Contrato: total debe ser positivo');
  const fecha = new Date(evento.fecha);
  if (!Number.isFinite(fecha.getTime()) || fecha.toISOString() !== evento.fecha) {
    throw new Error('Contrato: fecha debe ser ISO 8601 UTC');
  }
  return { eventoId: evento.id, producto: evento.producto, stock: reservarStock(stock, evento.cantidad) };
}
module.exports = { procesarVentaConfirmada };

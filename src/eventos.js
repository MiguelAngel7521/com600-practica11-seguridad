function construirEventoTareaCreada(tarea, ahora = new Date()) {
  return { id: tarea.id, titulo: tarea.titulo, creadaEn: ahora.toISOString() };
}
module.exports = { construirEventoTareaCreada };

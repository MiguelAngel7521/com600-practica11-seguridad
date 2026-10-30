function estadoDeTarea(tarea, ahora = new Date()) {
    if (!tarea || !tarea.titulo) {
        throw new Error("La tarea necesita un título");
    }
    if (tarea.completada) return "COMPLETADA";
    if (tarea.vence && new Date (tarea.vence) < ahora) return "ATRASADA";
    return "PENDIENTE";
}

module.exports = { estadoDeTarea };
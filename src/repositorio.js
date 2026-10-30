const { MongoClient } = require('mongodb');

async function crearRepositorio(uri) {
  const cliente = await new MongoClient(uri).connect();
  const coleccion = cliente.db('practica7').collection('tareas');
  return {
    guardar: tarea => coleccion.insertOne({ ...tarea }),
    buscarPorTitulo: titulo => coleccion.findOne({ titulo }),
    contar: () => coleccion.countDocuments(),
    actualizarEstado: (id, completada) => coleccion.updateOne({ _id: id }, { $set: { completada } }),
    eliminar: id => coleccion.deleteOne({ _id: id }),
    limpiar: () => coleccion.deleteMany({}),
    cerrar: () => cliente.close()
  };
}
module.exports = { crearRepositorio };

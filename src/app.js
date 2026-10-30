const express = require('express');
const { estadoDeTarea } = require('./tarea');
const { autenticar, exigirRol } = require('./auth');

function crearApp() {
  const app = express();
  const tareas = [];
  let siguienteId = 1;
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.get('/salud', (_req, res) => res.json({ estado: 'ok' }));
  app.use('/tareas', autenticar);
  app.post('/tareas', (req, res) => {
    if (typeof req.body?.titulo !== 'string' || !req.body.titulo.trim()) {
      return res.status(400).json({ error: 'titulo es obligatorio' });
    }
    const tarea = { titulo: req.body.titulo.trim(), id: siguienteId++, completada: false };
    if (typeof req.body.vence === 'string') tarea.vence = req.body.vence;
    tareas.push(tarea);
    return res.status(201).json(tarea);
  });
  app.get('/tareas', (_req, res) => res.json(
    tareas.map(tarea => ({ ...tarea, estado: estadoDeTarea(tarea) }))
  ));
  app.delete('/tareas/:id', exigirRol('admin'), (req, res) => {
    const i = tareas.findIndex(t => t.id === Number(req.params.id));
    if (i < 0) return res.status(404).json({ error: 'no existe' });
    tareas.splice(i, 1);
    return res.status(204).end();
  });
  return app;
}

module.exports = crearApp();
module.exports.crearApp = crearApp;

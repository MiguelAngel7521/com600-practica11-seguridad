require('dotenv').config({ quiet: true });
const app = require('./app');
const puerto = Number(process.env.PORT || 3000);
app.listen(puerto, process.env.HOST || '127.0.0.1', () => {
  console.log(`API de tareas en http://localhost:${puerto}`);
  console.log('JWT_SECRET cargado desde el entorno; valor no mostrado.');
});

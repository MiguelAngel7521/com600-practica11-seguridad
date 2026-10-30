const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function archivos(directorio) {
  return fs.readdirSync(directorio, { withFileTypes: true }).flatMap(entrada => {
    const ruta = path.join(directorio, entrada.name);
    return entrada.isDirectory() ? archivos(ruta) : [ruta];
  });
}

const codigo = [...[...archivos('src'), ...archivos('tests')].filter(ruta => ruta.endsWith('.js')), 'jest.config.js', 'analizar.cjs', 'verificar-mongo.cjs'];
for (const archivo of codigo) {
  const resultado = spawnSync(process.execPath, ['--check', archivo], { stdio: 'inherit' });
  if (resultado.error) throw resultado.error;
  if (resultado.status !== 0) process.exit(resultado.status || 1);
}
const json = ['package.json', 'src/tarea-creada.contrato.json', 'src/venta-confirmada.contrato.json'];
for (const archivo of json) JSON.parse(fs.readFileSync(archivo, 'utf8'));
console.log(`Análisis estático de sintaxis correcto: ${codigo.length} archivos JavaScript y ${json.length} JSON.`);

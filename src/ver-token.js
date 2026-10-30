// Decodificar no autentica: este comando NO verifica la firma ni pide la clave.
const partes = (process.argv[2] || '').split('.');
if (partes.length !== 3) throw new Error('Se necesitan tres partes separadas por dos puntos');
const [cab, carga, firma] = partes;
const leer = p => JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
console.log('Encabezado:', leer(cab));
console.log('Carga     :', leer(carga));
console.log('Firma     :', firma, `(${firma.length} caracteres)`);

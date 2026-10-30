# Práctica 11 · Seguridad en microservicios

Miguel Angel Rodriguez Vela · CU 35-5774 · COM-600 · Gestión 2/2026.

Parte 1: laboratorios 0 a 7 del enunciado, sobre la API y las 72 pruebas heredadas de las prácticas 7 y 8. Se añaden 21 pruebas de autenticación y autorización. La Hoja de Evidencias y su PDF se entregan localmente; no se publican documentos personales, capturas, tokens ni certificados.

## Ejecutar

Requiere Node >=22.15, npm y Docker activo para la integración con MongoDB.

```sh
npm ci
cp .env.example .env
# Rellenar JWT_SECRET con 48 bytes aleatorios en hexadecimal; no subir .env.
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm test
npm start
```

El programa se niega a arrancar sin JWT_SECRET. Las pruebas locales generan una clave efímera; GitHub Actions recibe un secreto independiente del repositorio, exclusivamente en el paso de pruebas.

```sh
TOKEN=$(node src/emitir-token.js)
curl -i http://localhost:3000/tareas -H "Authorization: Bearer $TOKEN"
```

El emisor de consola es una herramienta administrativa del laboratorio: requiere conocer la clave. No es un endpoint público de inicio de sesión ni una implementación de OAuth2/OIDC.

| Ruta | Acceso |
| --- | --- |
| GET /salud | Público, sin datos de negocio |
| GET /tareas | JWT de usuario o admin |
| POST /tareas | JWT de usuario o admin |
| DELETE /tareas/:id | JWT de admin |

Tokens HS256 de 15 minutos; validación de firma, emisor, audiencia, vencimiento, sujeto y rol. Una identidad inválida produce 401; un usuario identificado sin permiso de borrado recibe 403. El servidor conserva tareas en memoria. MongoDB solo se utiliza en la suite de integración heredada.

## HTTPS

```sh
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout certs/servidor.key -out certs/servidor.crt \
  -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1'
chmod 600 certs/servidor.key
npm run start:tls
curl -i --cacert certs/servidor.crt https://localhost:3443/tareas \
  -H "Authorization: Bearer $TOKEN"
```

## Calidad y cadena de suministro

```sh
npm run lint
npm run test:cov
npm audit --audit-level=critical
npm sbom --sbom-format cyclonedx > sbom.json
docker build -t api-tareas:seguridad .
trivy image --severity HIGH,CRITICAL api-tareas:seguridad
```

El workflow conserva pruebas, cobertura y análisis estático de la práctica 8. Incorpora auditoría y escaneo de imagen: un hallazgo crítico devuelve código 1 y bloquea el job de imagen. No publica ni despliega una imagen vulnerable. Docker instala solo dependencias de producción, arranca sin privilegios y recibe JWT_SECRET en ejecución, nunca durante la construcción.

La demostración de historial de Git se realiza en un repositorio desechable excluido, con una cadena ficticia que no es la clave del servicio. No se publica ese historial.

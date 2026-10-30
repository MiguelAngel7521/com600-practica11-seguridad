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

## Resultados verificados el 30/10/2026

- Línea de base: 7 suites, 72 pruebas. Entrega protegida: 8 suites, 93 pruebas; 98,95 % de líneas y 100 % de funciones cubiertas.
- Auditoría inicial: 1 crítico, 2 altos, 1 moderado y 5 bajos. Después de `npm audit fix` y de actualizar explícitamente jsonwebtoken a 9.0.3: 5 avisos bajos, sin moderados, altos ni críticos.
- Los avisos bajos corresponden a deepmerge y su cadena de dependencias de Jest. Son una deuda de las herramientas de pruebas, no incluidas en la imagen de ejecución; no se aplica la propuesta de retroceder Jest a una versión mayor antigua sin evaluar compatibilidad. Los informes completos permanecen visibles.
- Trivy local: la imagen inicial tenía 2 críticos y 19 altos; después de corregir los paquetes de la aplicación aún había 1 crítico en las herramientas de npm. El Dockerfile final construye dependencias en una etapa separada y copia solo Node y las dependencias de producción a Alpine actualizado. El escaneo final reporta 0 hallazgos.
- La imagen mínima se comprobó como UID 1000: GET /tareas sin token → 401; con token válido → 200.
- SBOM del proyecto: CycloneDX 1.5, 542 componentes. `sbom-imagen.json` corresponde al runtime final.

| Evidencia de CI | Resultado |
| --- | --- |
| [Dependencia vulnerable · a12d8ad](https://github.com/MiguelAngel7521/com600-practica11-seguridad/actions/runs/41079561259) | Pruebas correctas; auditoría bloquea el crítico de lodash; imagen omitida. |
| [Entrega corregida · 52df607](https://github.com/MiguelAngel7521/com600-practica11-seguridad/actions/runs/41080350364) | Pruebas, auditoría y escaneo de imagen aprobados. |

Los escaneos reflejan la base de avisos disponible al ejecutarlos; deben repetirse en cada entrega. `reportes/` permite contrastar el antes, la imagen intermedia y el resultado final. No se desactivó ninguna puerta de calidad para obtener el verde.

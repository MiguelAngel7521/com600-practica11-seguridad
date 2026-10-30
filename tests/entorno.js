// Clave aleatoria efímera local; CI inyecta su secreto dedicado.
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = require('node:crypto').randomBytes(48).toString('hex');

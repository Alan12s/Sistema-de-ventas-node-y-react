// backend/src/utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT para un usuario
 * @param {Object} user - Usuario para el que se genera el token
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
  // Datos que irán dentro del token
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    fullName: user.fullName
  };

  // Generar token que expira en 7 días
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return token;
};

/**
 * Verifica si un token es válido
 * @param {string} token - Token a verificar
 * @returns {Object|null} Datos del usuario o null si es inválido
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
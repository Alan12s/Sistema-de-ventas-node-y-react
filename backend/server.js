// backend/server.js
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { syncDatabase, User } = require('./src/models');
const { ROLES } = require('./src/constants/roles');

const PORT = process.env.PORT || 5000;

/**
 * Crear usuario administrador por defecto si no existe
 */
const createDefaultAdmin = async () => {
  try {
    // Verificar si ya existe un admin
    const adminExists = await User.findOne({
      where: { role: ROLES.ADMIN }
    });

    if (!adminExists) {
      // Crear admin por defecto
      await User.create({
        username: 'admin',
        email: 'admin@sistema.com',
        password: 'admin123', // Cambiar en producción
        fullName: 'Administrador del Sistema',
        role: ROLES.ADMIN
      });
      console.log('✓ Usuario administrador creado');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    } else {
      console.log('✓ Usuario administrador ya existe');
    }
  } catch (error) {
    console.error('✗ Error al crear admin:', error.message);
  }
};

/**
 * Iniciar el servidor
 */
const startServer = async () => {
  try {
    console.log('==========================================');
    console.log('🚀 Iniciando Sistema de Ventas...');
    console.log('==========================================\n');

    // 1. Probar conexión a la base de datos
    console.log('📊 Conectando a PostgreSQL...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // 2. Sincronizar modelos con la base de datos
    console.log('\n🔄 Sincronizando modelos...');
    await syncDatabase(false); // false = no borrar datos existentes
    
    // 3. Crear admin por defecto
    console.log('\n👤 Verificando usuario administrador...');
    await createDefaultAdmin();

    // 4. Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n==========================================');
      console.log('✅ Servidor iniciado correctamente');
      console.log('==========================================');
      console.log(`🌐 Servidor: http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log('==========================================\n');
      console.log('Presiona CTRL+C para detener el servidor\n');
    });

  } catch (error) {
    console.error('\n❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar
startServer();
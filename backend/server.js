// backend/server.js
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { syncDatabase, User } = require('./src/models');
const { ROLES } = require('./src/constants/roles');

const PORT = process.env.PORT || 5000;

const createDefaultUsers = async () => {
  try {
    // Crear Admin
    const adminExists = await User.findOne({
      where: { username: 'admin' }
    });

    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@sistema.com',
        password: 'admin123',
        fullName: 'Administrador del Sistema',
        role: ROLES.ADMIN
      });
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Crear Vendedor
    const sellerExists = await User.findOne({
      where: { username: 'vendedor' }
    });

    if (!sellerExists) {
      await User.create({
        username: 'vendedor',
        email: 'vendedor@sistema.com',
        password: 'vendedor123',
        fullName: 'Usuario Vendedor',
        role: ROLES.VENDEDOR
      });
      console.log('✅ Default seller user created');
      console.log('   Username: vendedor');
      console.log('   Password: vendedor123');
    } else {
      console.log('ℹ️  Seller user already exists');
    }

  } catch (error) {
    console.error('❌ Error creating default users:', error.message);
  }
};

const startServer = async () => {
  try {
    console.log('==========================================');
    console.log('Starting Sales System...');
    console.log('==========================================\n');

    console.log('Connecting to PostgreSQL...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('Could not connect to database');
    }

    console.log('\nSynchronizing models...');
    await syncDatabase(false);
    
    console.log('\nVerifying default users...');
    await createDefaultUsers();

    app.listen(PORT, () => {
      console.log('\n==========================================');
      console.log('Server started successfully');
      console.log('==========================================');
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log('==========================================');
      console.log('\n📋 Default Credentials:');
      console.log('👤 Admin:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('👤 Vendedor:');
      console.log('   Username: vendedor');
      console.log('   Password: vendedor123');
      console.log('==========================================\n');
      console.log('Press CTRL+C to stop the server\n');
    });

  } catch (error) {
    console.error('\n❌ Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();
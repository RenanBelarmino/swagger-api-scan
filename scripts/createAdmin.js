require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const argon2 = require('argon2');
const chalk = require('chalk');

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    // Sempre cria o usuário admin
    const hashedPassword = await argon2.hash(process.env.SWAGGER_PASSWORD);

    const adminUser = new User({
      id: 0,
      username: process.env.SWAGGER_USERNAME || 'admin',
      login: process.env.SWAGGER_LOGIN || 'admin',
      password: hashedPassword,
      admin: true,
      permissions: {
        sast: {
          scan: false,
          maxConcurrentScans: 0,
          currentConcurrentScans: 0,
        },
        dast: {
          scan: false,
          maxConcurrentScans: 0,
          currentConcurrentScans: 0,
        },
      },
    });

    await adminUser.save();

    // Mensagem de sucesso com o nome do sistema
    console.log(chalk.green(`
      ==========================================
           🛠️ ${chalk.bold('Admin User Creation Complete')} 🛠️
      ==========================================
      
         🗝️ ${chalk.bold('Username')}: ${chalk.cyan(process.env.SWAGGER_USERNAME || 'admin')}
         🔐 ${chalk.bold('Login')}: ${chalk.cyan(process.env.SWAGGER_LOGIN || 'admin')}
      
         🚀 ${chalk.bold('Status')}: ${chalk.bold.green('User created successfully!')}
      
      ==========================================
      
         🌐 ${chalk.bold('System Info')}: 
         - MongoDB URL: ${chalk.cyan(process.env.MONGO_URL)}
      
         📅 ${chalk.bold('Date')}: ${chalk.blue(new Date().toLocaleDateString())}
         ⏰ ${chalk.bold('Time')}: ${chalk.blue(new Date().toLocaleTimeString())}
      
      ==========================================
    `));

  } catch (error) {
    console.error(chalk.red('Error creating admin user:'), error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();

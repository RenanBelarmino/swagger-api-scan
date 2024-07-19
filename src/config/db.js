const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        //console.log('MONGO_URL:', process.env.MONGO_URL);
        //console.log('MONGO_USER:', process.env.MONGO_USER);
        //console.log('MONGO_PASSWORD:', process.env.MONGO_PASSWORD);

        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            
            auth: {
                username: process.env.MONGO_USER,
                password: process.env.MONGO_PASSWORD
            },
            authSource: 'admin'
        });
        console.log('MongoDB connected...');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;

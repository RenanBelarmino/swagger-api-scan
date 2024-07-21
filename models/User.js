const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    permissions: {
        sast: {
            scan: { type: Number, required: true },  // 1 = true, 0 = false
            maxConcurrentScans: { type: Number, required: true },
            currentConcurrentScans: { type: Number, default: 0 }
        },
        dast: {
            scan: { type: Number, required: true },  // 1 = true, 0 = false
            maxConcurrentScans: { type: Number, required: true },
            currentConcurrentScans: { type: Number, default: 0 }
        }
    }
});

// Criação do modelo com o schema definido
const User = mongoose.model('User', UserSchema);

module.exports = User;

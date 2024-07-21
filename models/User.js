const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    username: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    permissions: {
        sast: {
            scan: { type: Boolean, required: true },  // true ou false
            maxConcurrentScans: { type: Number, required: true },
            currentConcurrentScans: { type: Number, default: 0 }
        },
        dast: {
            scan: { type: Boolean, required: true },  // true ou false
            maxConcurrentScans: { type: Number, required: true },
            currentConcurrentScans: { type: Number, default: 0 }
        }
    }
});

// Criação do modelo com o schema definido
const User = mongoose.model('User', UserSchema);

module.exports = User;

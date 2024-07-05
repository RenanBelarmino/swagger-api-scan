const users = require('../config/users');

const hasPermission = (username, scanType) => {
    const user = users[username];
    if (!user) {
        console.log(`[CONSOLE] - Usuário não encontrado: ${username}`);
        return false;
    }

    const userPermissions = user.permissions;
    if (!userPermissions.includes(scanType)) {
        console.log(`[CONSOLE] - Usuário ${username} não tem permissão para iniciar um scan do tipo ${scanType}`);
        return false;
    }

    return true;
};

module.exports = { hasPermission };

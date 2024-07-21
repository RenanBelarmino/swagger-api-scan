const User = require('../../models/User');

const hasPermission = async (username, scanType) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: ${username}`);
            return false;
        }

        const userPermissions = user.permissions[scanType];
        if (!userPermissions || userPermissions.scan !== 1) { // 1 = true, 0 = false
            console.log(`[CONSOLE] - Usuário ${username} não tem permissão para iniciar um scan do tipo ${scanType}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error(`[ERROR] - Erro ao verificar permissões: ${error.message}`);
        return false;
    }
};

module.exports = { hasPermission };

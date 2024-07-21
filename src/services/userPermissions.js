const User = require('../../models/User');

const hasPermission = async (login, scanType) => {
    try {
        const user = await User.findOne({ login });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: login=${login}, ID=${user ? user.id : 'N/A'}`);
            return false;
        }

        const userPermissions = user.permissions[scanType];
        if (!userPermissions || userPermissions.scan !== true) { // true = verdadeiro
            console.log(`[CONSOLE] - Usuário não tem permissão na API ${scanType}: login=${login}, ID=${user.id}`);
            return false;
        }

        console.log(`[CONSOLE] - Permissão verificada com sucesso: login=${login}, ID=${user.id}`);
        return true;
    } catch (error) {
        console.error(`[ERROR] - Erro ao verificar permissões para login=${login}: ${error.message}`);
        return false;
    }
};

module.exports = { hasPermission };

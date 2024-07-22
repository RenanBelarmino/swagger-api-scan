const User = require('../../models/User');

const isAdmin = async (login) => {
    try {
        const user = await User.findOne({ login });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: login=${login}`);
            return false;
        }

        if (user.admin) {
            console.log(`[CONSOLE] - Usuário é administrador: login=${login}, ID=${user.id}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`[ERROR] - Erro ao verificar administrador para login=${login}: ${error.message}`);
        return false;
    }
};

const hasPermission = async (login, scanType) => {
    try {
        const user = await User.findOne({ login });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: login=${login}, ID=N/A`);
            return false;
        }

        const userPermissions = user.permissions[scanType];
        if (!userPermissions || userPermissions.scan !== true) {
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

module.exports = { isAdmin, hasPermission };

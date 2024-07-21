const User = require('../../models/User');

const canStartConcurrentScan = async (login, scanType) => {
    try {
        const user = await User.findOne({ login });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: login=${login}, ID=${user ? user.id : 'N/A'}`);
            return false;
        }

        const scanConfig = user.permissions[scanType];
        if (!scanConfig) {
            console.log(`[CONSOLE] - Tipo de scan desconhecido: ${scanType}, login=${login}, ID=${user.id}`);
            return false;
        }

        const { maxConcurrentScans, currentConcurrentScans } = scanConfig;
        console.log(`[CONSOLE] - Usuário ${login} (ID=${user.id}) tem ${maxConcurrentScans} de ${scanType} concorrentes configurados`);

        if (currentConcurrentScans >= maxConcurrentScans) {
            console.log(`[CONSOLE] - Limite de scans concorrentes atingido para o usuário: login=${login}, ID=${user.id}`);
            return false;
        }

        // Atualizar a contagem de scans concorrentes
        user.permissions[scanType].currentConcurrentScans++;
        await user.save(); // Salve a contagem atualizada de scans concorrentes no banco de dados
        console.log(`[CONSOLE] - Contagem de scans concorrentes atualizada para o usuário: login=${login}, ID=${user.id}, Scans Atuais=${user.permissions[scanType].currentConcurrentScans}`);
        return true;
    } catch (error) {
        console.error(`[ERROR] - Erro ao verificar scans concorrentes para login=${login}: ${error.message}`);
        return false;
    }
};

const concludeScan = async (login, scanType) => {
    try {
        const user = await User.findOne({ login });
        if (user && user.permissions[scanType]) {
            // Resetar a contagem de scans concorrentes para o tipo específico
            user.permissions[scanType].currentConcurrentScans = 0;
            await user.save(); // Salve a contagem resetada no banco de dados
            console.log(`[CONSOLE] - Contagem de scans concorrentes resetada para o usuário: login=${login}, ID=${user.id}`);
        }
    } catch (error) {
        console.error(`[ERROR] - Erro ao concluir scan para login=${login}: ${error.message}`);
    }
};

module.exports = { canStartConcurrentScan, concludeScan };

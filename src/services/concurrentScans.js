const User = require('../../models/User');

const canStartConcurrentScan = async (username, scanType) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: ${username}`);
            return false;
        }

        const scanConfig = user.permissions[scanType];
        if (!scanConfig) {
            console.log(`[CONSOLE] - Tipo de scan desconhecido: ${scanType}`);
            return false;
        }

        const { maxConcurrentScans, currentConcurrentScans } = scanConfig;
        console.log(`[CONSOLE] - Usuário ${username} tem ${maxConcurrentScans} de ${scanType} Concorrentes Configurado`);

        if (currentConcurrentScans >= maxConcurrentScans) {
            console.log(`[CONSOLE] - Limite de scans concorrentes atingido para o usuário: ${username}`);
            return false;
        }

        // Atualizar a contagem de scans concorrentes
        user.permissions[scanType].currentConcurrentScans++;
        await user.save(); // Salve a contagem atualizada de scans concorrentes no banco de dados
        return true;
    } catch (error) {
        console.error(`[ERROR] - Erro ao verificar scans concorrentes: ${error.message}`);
        return false;
    }
};

const concludeScan = async (username, scanType) => {
    try {
        const user = await User.findOne({ username });
        if (user && user.permissions[scanType]) {
            // Resetar a contagem de scans concorrentes para o tipo específico
            user.permissions[scanType].currentConcurrentScans = 0;
            await user.save(); // Salve a contagem resetada no banco de dados
            console.log(`[CONSOLE] - Resetando contagem de scans concorrentes para o usuário: ${username}`);
        }
    } catch (error) {
        console.error(`[ERROR] - Erro ao concluir scan: ${error.message}`);
    }
};

module.exports = { canStartConcurrentScan, concludeScan };

const users = require('./users');

const canStartConcurrentScan = (username) => {
    const user = users[username];
    if (!user) {
        console.log(`[CONSOLE] - Usuário não encontrado: ${username}`);
        return false;
    }

    const userPermissions = user.permissions;
    const maxConcurrentScans = parseInt(user.CONCURRENT_SCANS);
    console.log(`[CONSOLE] - Usuário ${username} tem ${maxConcurrentScans} de Scan Concorrentes Configurado`);

    if (!user.currentConcurrentScans) {
        user.currentConcurrentScans = 0;
    }

    if (user.currentConcurrentScans >= maxConcurrentScans) {
        console.log(`[CONSOLE] - Limite de scans concorrentes atingido para o usuário: ${username}`);
        return false;
    }

    user.currentConcurrentScans++;
    return true;
};

const concludeDASTScan = (username) => {
    const user = users[username];
    if (user && user.currentConcurrentScans) {
        user.currentConcurrentScans = 0;
        console.log(`[CONSOLE] - Resetando contagem de scans concorrentes para o usuário: ${username}`);
    }
    // Caso o usuário não seja encontrado ou não tenha currentConcurrentScans, não faz nada
};

module.exports = { canStartConcurrentScan, concludeDASTScan };

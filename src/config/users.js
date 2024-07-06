const users = {
    renan: {
        password: 'renan123',
        permissions: ['SAST'],
        CONCURRENT_SCANS: 1
    },
    nicholas: {
        password: 'nicholas123',
        permissions: ['DAST', 'SAST'],
        CONCURRENT_SCANS: 2

    },
    jardel: {
        password: 'jardel123',
        permissions: ['DAST', 'SAST'],
        CONCURRENT_SCANS: 1

    },
    joao: {
        password: 'joao123',
        permissions: ['DAST', 'SAST'],
        CONCURRENT_SCANS: 1

    }
};
module.exports = users;

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

    }
};
module.exports = users;

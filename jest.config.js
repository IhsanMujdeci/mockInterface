module.exports = {
    transform: {
        '^.+\\.(t|j)sx?$': '@swc-node/jest',
    },
    collectCoverage: true,
    clearMocks: true,
    rootDir: 'src',
    coverageReporters: ['text'],
    testEnvironment: 'node',
    testMatch: ['**/*.(integration|test).ts'],
};

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/unit/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage/unit',
  testEnvironment: 'node',
  // ✅ Fix: Change from moduleNameMapping to moduleNameMapper
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/utils/test-setup.ts'],
  // ✅ Add: Tell Jest to ignore certain modules
  transformIgnorePatterns: ['node_modules/(?!(file-type)/)'],
};

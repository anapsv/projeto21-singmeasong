
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    'node_modules',
    'test-config',
    'interfaces',
    'src/repositories',
    'jestGlobalMocks.ts',
    'src/server.ts',
    'src/utils',
    'src/database.ts',
    'tests/factories'
  ]
};
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/out/"],
  moduleNameMapper: {
    "^react-markdown$": "<rootDir>/tests/__mocks__/react-markdown.tsx",
  },
};

module.exports = createJestConfig(customJestConfig);

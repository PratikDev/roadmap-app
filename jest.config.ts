import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: [
        "<rootDir>/src/db/**/__tests__/**/*.test.ts",
        "<rootDir>/src/schemas/**/__tests__/**/*.test.ts",
        "<rootDir>/src/lib/**/__tests__/**/*.test.ts",
        "<rootDir>/src/proxy.test.ts",
        "<rootDir>/src/app/\\(backend\\)/**/__tests__/**/*.test.ts",
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      transform: {
        "^.+\\.(t|j)sx?$": [
          "babel-jest",
          {
            presets: [
              ["next/babel", { "preset-react": { runtime: "automatic" } }],
            ],
          },
        ],
      },
    },
    {
      displayName: "jsdom",
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/src/components/**/__tests__/**/*.test.tsx",
        "<rootDir>/src/app/\\(frontend\\)/**/__tests__/**/*.test.tsx",
      ],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      transform: {
        "^.+\\.(t|j)sx?$": [
          "babel-jest",
          {
            presets: [
              ["next/babel", { "preset-react": { runtime: "automatic" } }],
            ],
          },
        ],
      },
    },
  ],
};

export default createJestConfig(config);

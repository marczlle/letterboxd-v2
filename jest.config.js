/* eslint-disable @typescript-eslint/no-require-imports */

/** @type {import('jest').Config} */

const nextJest = require('next/jest');


const createJestConfig = nextJest({

  dir: './',

});


const customJestConfig = {

  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  moduleNameMapper: {

    '^@/(.*)$': '<rootDir>/src/$1',

  },

};


module.exports = createJestConfig(customJestConfig);
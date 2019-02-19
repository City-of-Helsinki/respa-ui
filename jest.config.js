// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    // Global vars
    globals: {
      "SETTINGS": true
    },
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
  
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: ['src/**/*.{js,jsx,mjs}'],
  
    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',
  
    // An array of file extensions your modules use
    moduleFileExtensions: ['js', 'jsx'],
  
    // Same with webpack module resolver
    moduleDirectories: ["node_modules", "app"],

    // The paths to modules that run some code to configure or set up the testing environment before each test
    setupFiles: ['<rootDir>config/setupJest.js'],
  
    // The test environment that will be used for testing
    testEnvironment: 'jsdom',
  
    // The glob patterns Jest uses to detect test files
    testMatch: ['**/?(*.)+(spec).js?(x)'],
  
    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: ['\\\\node_modules\\\\'],
  
    // This option sets the URL for the jsdom environment. It is reflected in properties such as location.href
    testURL: 'http://localhost',
  
    // Babel transform 
    transform: {
      "^.+\\.jsx?$": "babel-jest"
    },
    // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    
    // Indicates whether each individual test should be reported during the run
    verbose: false,
  };

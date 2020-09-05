module.exports = {
  diff: true,
  extension: ['js'],
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 2000,
  ui: 'bdd',
  // files to import before tests
  file: [
    'test/test.js',
    //'test/setup.js',
    //'test/helpers.js',
    //'internal/index.js',
  ],
  // test files
  //'watch-files': ['test/*/index.js'],
};

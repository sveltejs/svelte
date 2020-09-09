// paths are relative to project root

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
    'test/test.js'
  ]
  // not used. test files are called from test/test.js
  //'watch-files': ['test/*/index.js'],
};

const glob = require('tiny-glob/sync.js');

require('./setup');

// bind internal to jsdom
require('./helpers.ts');
require('../internal');

console.clear();

const test_folders = glob('*/index.ts', { cwd: 'test' });
const solo_folders = test_folders.filter(folder => /\.solo/.test(folder));

if (solo_folders.length) {
	if (process.env.CI) {
		throw new Error('Forgot to remove `.solo` from test');
	}
	solo_folders.forEach(name => require('./' + name));
} else {
	test_folders.forEach(name => require('./' + name));
}

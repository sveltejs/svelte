const glob = require('tiny-glob/sync.js');

require('./setup');

// bind internal to jsdom
require('./helpers');
require('../internal');

console.clear();

const testFolders = glob('*/index.js', { cwd: 'test' });
const solo = testFolders.find(folder => /\.solo/.test(folder));

if (solo) {
	if (process.env.CI) {
		throw new Error('Forgot to remove `solo: true` from test');
	}
	require('./' + solo);
} else {
	testFolders.forEach(file => {
		console.log('file', file);
		require('./' + file);
	});
}

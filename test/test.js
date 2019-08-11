const glob = require('tiny-glob/sync.js');

require('./setup');

// bind internal to jsdom
require('./helpers');
require('../internal');

glob('*/index.js', { cwd: 'test' }).forEach((file) => {
	require('./' + file);
});

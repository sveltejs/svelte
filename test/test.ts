const glob = require('tiny-glob/sync.js');

require('./setup');

// bind internal to jsdom
require('./helpers.ts');
require('../internal');

console.clear();

const browser_tests = ['custom-elements', 'runtime-puppeteer'];
const to_run_browser_tests = get_to_run_browser_tests();

const test_folders = glob('*/index.ts', { cwd: 'test' })
	.filter(folder => to_run_browser_tests === browser_tests.some(test => folder.startsWith(test)));

const solo_folders = test_folders.filter(folder => /\.solo/.test(folder));

if (solo_folders.length) {
	if (process.env.CI) {
		throw new Error('Forgot to remove `.solo` from test');
	}
	solo_folders.forEach(name => require('./' + name));
} else {
	test_folders.forEach(name => require('./' + name));
}

function get_to_run_browser_tests() {
	const browser_flag = '--browser=';
	const argv = process.argv.find(argv => argv.startsWith(browser_flag));
	return !!argv && argv.slice(browser_flag.length) === 'true';
}
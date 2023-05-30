import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

fs.writeFileSync(
	'./src/shared/version.js',
	`/** @type {string} */\nexport const VERSION = '${pkg.version}';`
);

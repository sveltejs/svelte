import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

fs.writeFileSync(
	'./src/shared/version.js',
	`// generated during release, do not modify\n\n/** @type {string} */\nexport const VERSION = '${pkg.version}';\n`
);

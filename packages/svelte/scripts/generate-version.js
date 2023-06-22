import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

fs.writeFileSync(
	'./src/shared/version.js',
	`// generated during release, do not modify\n\n/** @type {string} */
export const VERSION = '${pkg.version}';
export const PUBLIC_VERSION = '${pkg.version.split('.')[0]}';
`
);

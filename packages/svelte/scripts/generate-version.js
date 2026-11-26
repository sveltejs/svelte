import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const content = `// generated during release, do not modify

/**
 * The current version, as set in package.json.
 * @type {string}
 */
export const VERSION = '${pkg.version}';
export const PUBLIC_VERSION = '${pkg.version.split('.')[0]}';
`;

const file = './src/version.js';

if (!fs.existsSync(file) || fs.readFileSync(file, 'utf-8') !== content) {
	fs.writeFileSync(file, content);
}

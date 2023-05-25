// this file will replace all the expected.js files with their _actual
// equivalents. Only use it when you're sure that you haven't
// broken anything!
import * as fs from 'node:fs';
import glob from 'tiny-glob/sync.js';

glob('samples/*/_actual.js', { cwd: __dirname }).forEach((file) => {
	const actual = fs.readFileSync(`${__dirname}/${file}`, 'utf-8');
	fs.writeFileSync(`${__dirname}/${file.replace('_actual.js', 'expected.js')}`, actual);
});

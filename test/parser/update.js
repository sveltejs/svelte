// this file will replace all the output.json files with their _actual.json
// equivalents. Only use it when you're sure that you haven't
// broken anything!
import * as fs from 'node:fs';
import glob from 'tiny-glob/sync.js';

glob('samples/*/_actual.json', { cwd: __dirname }).forEach((file) => {
	const actual = fs.readFileSync(`${__dirname}/${file}`, 'utf-8');
	fs.writeFileSync(`${__dirname}/${file.replace('_actual.json', 'output.json')}`, actual);
});

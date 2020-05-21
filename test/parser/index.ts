import * as fs from 'fs';
import { svelte, tryToLoadJson } from '../helpers';
import { assert } from '../test';

describe('parser', () => {
	fs.readdirSync(`${__dirname}/samples`).forEach(dir => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo$/.test(dir);

		if (solo && process.env.CI) {
			throw new Error(`Forgot to remove '.solo' from test parser/samples/${dir}`);
		}

		const skip = !fs.existsSync(`${__dirname}/samples/${dir}/input.svelte`);

		(skip ? it.skip : solo ? it.only : it)(dir, () => {
			const options = tryToLoadJson(`${__dirname}/samples/${dir}/options.json`) || {};

			const input = fs.readFileSync(`${__dirname}/samples/${dir}/input.svelte`, 'utf-8').replace(/\s+$/, '');
			const expectedOutput = tryToLoadJson(`${__dirname}/samples/${dir}/output.json`);
			const expectedError = tryToLoadJson(`${__dirname}/samples/${dir}/error.json`);

			try {
				const { ast } = svelte.compile(input, Object.assign(options, {
					generate: false
				}));

				fs.writeFileSync(`${__dirname}/samples/${dir}/_actual.json`, JSON.stringify(ast, null, '\t'));

				assert.deepEqual(ast.html, expectedOutput.html);
				assert.deepEqual(ast.css, expectedOutput.css);
				assert.deepEqual(ast.instance, expectedOutput.instance);
				assert.deepEqual(ast.module, expectedOutput.module);
			} catch (err) {
				if (err.name !== 'ParseError' || !expectedError) throw err;
				assert.deepEqual(JSON.parse(JSON.stringify({ ...err, message: err.message })), expectedError);
			}
		});
	});
});

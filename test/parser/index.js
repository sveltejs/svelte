import assert from 'assert';
import fs from 'fs';
import { svelte, tryToLoadJson } from '../helpers.js';

describe('parse', () => {
	fs.readdirSync('test/parser/samples').forEach(dir => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo$/.test(dir);

		if (solo && process.env.CI) {
			throw new Error(
				`Forgot to remove '.solo' from test parser/samples/${dir}`
			);
		}

		(solo ? it.only : it)(dir, () => {
			const options = tryToLoadJson(`test/parser/samples/${dir}/options.json`) || {};

			function test(options, input, expectedOutput, expectedError, outputFile) {
				try {
					const actual = svelte.parse(input, options);

					fs.writeFileSync(outputFile, JSON.stringify(actual, null, '\t'));

					assert.deepEqual(actual.html, expectedOutput.html);
					assert.deepEqual(actual.css, expectedOutput.css);
					assert.deepEqual(actual.js, expectedOutput.js);
				} catch (err) {
					if (err.name !== 'ParseError') throw err;
					if (!expectedError) throw err;

					try {
						assert.equal(err.code, expectedError.code);
						assert.equal(err.message, expectedError.message);
						assert.deepEqual(err.loc, expectedError.loc);
						assert.equal(err.pos, expectedError.pos);
						assert.equal(err.toString().split('\n')[0], `${expectedError.message} (${expectedError.loc.line}:${expectedError.loc.column})`);
					} catch (err2) {
						const e = err2.code === 'MODULE_NOT_FOUND' ? err : err2;
						throw e;
					}
				}
			}

			// TODO remove v1 tests
			test(
				options,
				fs.readFileSync(`test/parser/samples/${dir}/input.html`, 'utf-8').replace(/\s+$/, ''),
				tryToLoadJson(`test/parser/samples/${dir}/output.json`),
				tryToLoadJson(`test/parser/samples/${dir}/error.json`),
				`test/parser/samples/${dir}/_actual.json`
			);

			test(
				Object.assign({ parser: 'v2' }, options),
				fs.readFileSync(`test/parser/samples/${dir}/input-v2.html`, 'utf-8').replace(/\s+$/, ''),
				tryToLoadJson(`test/parser/samples/${dir}/output-v2.json`),
				tryToLoadJson(`test/parser/samples/${dir}/error-v2.json`),
				`test/parser/samples/${dir}/_actual-v2.json`
			);
		});
	});

	it('handles errors with options.onerror', () => {
		let errored = false;

		svelte.compile(`<h1>unclosed`, {
			onerror(err) {
				errored = true;
				assert.equal(err.message, `<h1> was left open`);
			}
		});

		assert.ok(errored);
	});

	it('throws without options.onerror', () => {
		assert.throws(() => {
			svelte.compile(`<h1>unclosed`);
		}, /<h1> was left open/);
	});

	it('includes AST in svelte.compile output', () => {
		const source = fs.readFileSync(`test/parser/samples/attribute-dynamic/input.html`, 'utf-8');

		const { ast } = svelte.compile(source);
		const parsed = svelte.parse(source);
		assert.deepEqual(ast, parsed);
	});
});

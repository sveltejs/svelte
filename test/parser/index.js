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
			const input = fs
				.readFileSync(`test/parser/samples/${dir}/input.html`, 'utf-8')
				.replace(/\s+$/, '');

			const input_v2 = fs
				.readFileSync(`test/parser/samples/${dir}/input-v2.html`, 'utf-8')
				.replace(/\s+$/, '');

			const options = tryToLoadJson(`test/parser/samples/${dir}/options.json`) || {};

			try {
				const actual = svelte.parse(input, options);
				const expected = require(`./samples/${dir}/output.json`);

				fs.writeFileSync(
					`test/parser/samples/${dir}/_actual.json`,
					JSON.stringify(actual, null, '\t')
				);

				assert.deepEqual(actual.html, expected.html);
				assert.deepEqual(actual.css, expected.css);
				assert.deepEqual(actual.js, expected.js);

				// TODO remove v1 tests
				const actual_v2 = svelte.parse(input_v2, Object.assign({ parser: 'v2' }, options));
				const expected_v2 = require(`./samples/${dir}/output-v2.json`);

				fs.writeFileSync(
					`test/parser/samples/${dir}/_actual-v2.json`,
					JSON.stringify(actual_v2, null, '\t')
				);

				assert.deepEqual(actual_v2.html, expected_v2.html);
				assert.deepEqual(actual_v2.css, expected_v2.css);
				assert.deepEqual(actual_v2.js, expected_v2.js);
			} catch (err) {
				if (err.name !== 'ParseError') throw err;

				try {
					const expected = require(`./samples/${dir}/error.json`);

					assert.equal(err.message, expected.message);
					assert.deepEqual(err.loc, expected.loc);
					assert.equal(err.pos, expected.pos);
					assert.equal(err.toString().split('\n')[0], `${expected.message} (${expected.loc.line}:${expected.loc.column})`);
				} catch (err2) {
					const e = err2.code === 'MODULE_NOT_FOUND' ? err : err2;
					throw e;
				}
			}
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

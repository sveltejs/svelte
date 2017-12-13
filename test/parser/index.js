import assert from 'assert';
import fs from 'fs';
import { svelte } from '../helpers.js';

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

			try {
				const actual = svelte.parse(input);
				fs.writeFileSync(
					`test/parser/samples/${dir}/_actual.json`,
					JSON.stringify(actual, null, '\t')
				);
				const expected = require(`./samples/${dir}/output.json`);

				assert.deepEqual(actual.html, expected.html);
				assert.deepEqual(actual.css, expected.css);
				assert.deepEqual(actual.js, expected.js);
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
		const dir = fs.readdirSync('test/parser/samples')[0];
		const source = fs.readFileSync(`test/parser/samples/${dir}/input.html`, 'utf-8');

		const { ast } = svelte.compile(source);
		const parsed = svelte.parse(source);
		assert.deepEqual(ast, parsed);
	});
});

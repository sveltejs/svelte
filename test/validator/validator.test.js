import * as fs from 'node:fs';
import { describe, it, assert } from 'vitest';
import * as svelte from 'svelte/compiler';
import { try_load_json, try_load_config } from '../helpers.js';

describe('validate', () => {
	fs.readdirSync(`${__dirname}/samples`).forEach((dir) => {
		if (dir[0] === '.') return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);
		const skip = /\.skip/.test(dir);

		const it_fn = solo ? it.only : skip ? it.skip : it;

		it_fn(dir, async () => {
			const config = await try_load_config(`${__dirname}/samples/${dir}/_config.js`);

			const input = fs
				.readFileSync(`${__dirname}/samples/${dir}/input.svelte`, 'utf-8')
				.replace(/\s+$/, '')
				.replace(/\r/g, '');

			const expected_warnings = try_load_json(`${__dirname}/samples/${dir}/warnings.json`) || [];
			const expected_errors = try_load_json(`${__dirname}/samples/${dir}/errors.json`);
			const options = try_load_json(`${__dirname}/samples/${dir}/options.json`);

			let error;

			try {
				const { warnings } = svelte.compile(input, {
					dev: config.dev,
					legacy: config.legacy,
					generate: false,
					customElement: config.customElement,
					...options
				});

				assert.deepEqual(
					warnings.map((w) => ({
						code: w.code,
						message: w.message,
						start: { line: w.start.line, column: w.start.column },
						end: { line: w.end.line, column: w.end.column }
					})),
					expected_warnings
				);
			} catch (e) {
				error = e;
			}

			const expected = expected_errors && expected_errors[0];

			if (error || expected) {
				if (error && !expected) {
					throw error;
				}

				if (expected && !error) {
					throw new Error(`Expected an error: ${expected.message}`);
				}

				try {
					assert.deepEqual(
						{
							code: error.code,
							message: error.message,
							start: { line: error.start.line, column: error.start.column },
							end: { line: error.end.line, column: error.end.column }
						},
						expected
					);
				} catch (e) {
					console.error(error);
					throw e;
				}
			}
		});
	});

	it('errors if options.name is illegal', () => {
		assert.throws(() => {
			svelte.compile('<div></div>', {
				name: 'not.valid',
				generate: false
			});
		}, /options\.name must be a valid identifier/);
	});

	it('check warning position', () => {
		const { warnings } = svelte.compile('\n  <img \n src="foo.jpg">\n', {
			generate: false
		});

		assert.deepEqual(
			warnings.map((w) => {
				return {
					code: w.code,
					frame: w.frame,
					message: w.message,
					start: {
						column: w.start.column,
						line: w.start.line
					},
					end: {
						column: w.end.column,
						line: w.end.line
					},
					pos: w.pos
				};
			}),
			[
				{
					code: 'a11y-missing-attribute',
					frame: '1: \n2:   <img \n     ^\n3:  src="foo.jpg">\n4: ',
					message: 'A11y: <img> element should have an alt attribute',
					start: {
						column: 2,
						line: 2
					},
					end: {
						column: 15,
						line: 3
					},
					pos: 3
				}
			]
		);
	});

	it('warns if options.name is not capitalised', () => {
		const { warnings } = svelte.compile('<div></div>', {
			name: 'lowercase',
			generate: false
		});

		assert.deepEqual(
			warnings.map((w) => ({
				code: w.code,
				message: w.message
			})),
			[
				{
					code: 'options-lowercase-name',
					message: 'options.name should be capitalised'
				}
			]
		);
	});

	it('does not warn if options.name begins with non-alphabetic character', () => {
		const { warnings } = svelte.compile('<div></div>', {
			name: '_',
			generate: false
		});

		assert.deepEqual(warnings, []);
	});

	it('errors if namespace is provided but unrecognised', () => {
		assert.throws(() => {
			svelte.compile('<div></div>', {
				name: 'test',
				namespace: 'svefefe'
			});
		}, /Invalid namespace 'svefefe'/);
	});

	it('errors with a hint if namespace is provided but unrecognised but close', () => {
		assert.throws(() => {
			svelte.compile('<div></div>', {
				name: 'test',
				namespace: 'foriegn'
			});
		}, /Invalid namespace 'foriegn' \(did you mean 'foreign'\?\)/);
	});

	it("does not throw error if 'this' is bound for foreign element", () => {
		assert.doesNotThrow(() => {
			svelte.compile(
				`
			<script>
				let whatever;
			</script>
			<div bind:this={whatever} />`,
				{
					name: 'test',
					namespace: 'foreign'
				}
			);
		});
	});
});

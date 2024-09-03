import * as fs from 'node:fs';
import { it, assert } from 'vitest';
import { compile, compileModule } from 'svelte/compiler';
import { try_load_json } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';
import type { CompileError } from '#compiler';

interface ValidatorTest extends BaseTest {
	compileOptions?: Partial<import('#compiler').CompileOptions>;
	error?: {
		code: string;
		message: string;
	};
}

const { test, run } = suite<ValidatorTest>(async (config, cwd) => {
	const expected_warnings = try_load_json(`${cwd}/warnings.json`) || [];
	const expected_errors = try_load_json(`${cwd}/errors.json`);
	const options = try_load_json(`${cwd}/options.json`);

	let error;

	try {
		const module = fs.existsSync(`${cwd}/input.svelte.js`);

		const input = (
			module
				? fs.readFileSync(`${cwd}/input.svelte.js`, 'utf-8')
				: fs.readFileSync(`${cwd}/input.svelte`, 'utf-8')
		)
			.replace(/\s+$/, '')
			.replace(/\r/g, '');

		const { warnings } = (module ? compileModule : compile)(input, {
			...config.compileOptions,
			generate: false,
			...options
		});

		assert.deepEqual(
			warnings.map((w) => ({
				code: w.code,
				message: w.message,
				start: { line: w.start?.line, column: w.start?.column },
				end: { line: w.end?.line, column: w.end?.column }
			})),
			expected_warnings
		);
	} catch (e) {
		error = e as CompileError;
	}

	const expected = expected_errors && expected_errors[0];

	if (error && expected) {
		assert.deepEqual(
			{
				code: error.code,
				message: error.message,
				start: { line: error.start?.line, column: error.start?.column },
				end: { line: error.end?.line, column: error.end?.column }
			},
			{
				code: expected.code,
				message: expected.message,
				start: expected.start,
				end: expected.end
			}
		);
	} else if (expected) {
		throw new Error(`Expected an error: ${expected.message}`);
	} else if (error) {
		throw error;
	}
});

export { test };

await run(__dirname);

it.skip('errors if options.name is illegal', () => {
	assert.throws(() => {
		compile('<div></div>', {
			name: 'not.valid',
			generate: false
		});
	}, /options\.name must be a valid identifier/);
});

it.skip('check warning position', () => {
	const { warnings } = compile('\n  <img \n src="foo.jpg">\n', {
		generate: false
	});

	assert.deepEqual(warnings, [
		{
			code: 'a11y-missing-attribute',
			message: 'A11y: `<img>` element should have an alt attribute',
			start: { column: 2, line: 2, character: 3 },
			end: { column: 15, line: 3, character: 24 }
		}
	]);
});

it.skip('warns if options.name is not capitalised', () => {
	const { warnings } = compile('<div></div>', {
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
	const { warnings } = compile('<div></div>', {
		name: '_',
		generate: false
	});

	assert.deepEqual(warnings, []);
});

it('errors if namespace is provided but unrecognised', () => {
	assert.throws(() => {
		compile('<div></div>', {
			name: 'test',
			// @ts-expect-error
			namespace: 'svefefe'
		});
	}, /namespace should be one of "html", "mathml" or "svg"/);
});

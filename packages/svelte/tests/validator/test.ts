import * as fs from 'node:fs';
import { it, assert } from 'vitest';
import { compile, compileModule } from 'svelte/compiler';
import { try_load_json } from '../helpers.js';
import { suite, type BaseTest } from '../suite.js';
import type { CompileError, CompileOptions } from '#compiler';

interface ValidatorTest extends BaseTest {
	compileOptions?: Partial<import('#compiler').CompileOptions>;
	error?: {
		code: string;
		message: string;
	};
}

/**
 * Remove the "https://svelte.dev/e/..." link
 */
function strip_link(message: string) {
	return message.slice(0, message.lastIndexOf('\n'));
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
				message: strip_link(w.message),
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
				message: strip_link(error.message),
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

it.each([
	'<mesh><box /></mesh>',
	'<p><div /></p>',
	'<li><li /></li>',
	'<td><td /></td>',
	'<input><label /></input>',
	'<img><label /></img>'
])('does not impose HTML parsing rules on custom renderer elements: %s', (body) => {
	const head = '<svelte:options customRenderer="some-renderer" />';
	for (const generate of ['client', 'server'] as const) {
		for (const source of [head + body, body + head]) {
			const { warnings } = compile(source, { generate, experimental: { customRenderer: true } });
			assert.deepEqual(warnings, []);
		}
		for (const customRenderer of ['some-renderer', () => 'some-renderer']) {
			const { warnings } = compile(body, { generate, experimental: { customRenderer } });
			assert.deepEqual(warnings, []);
		}
	}
});

it('keeps HTML parsing rules for DOM components, including renderer opt-outs', () => {
	for (const body of ['<p><div /></p>', '<li><li /></li>', '<input><label /></input>']) {
		for (const customRenderer of [true, 'some-renderer', () => 'some-renderer'] as const) {
			const head = '<svelte:options customRenderer={null} />';
			for (const source of [head + body, body + head]) {
				assert.throws(
					() => compile(source, { experimental: { customRenderer } }),
					/(?:element_invalid_closing_tag_autoclosed|void_element_invalid_content)/
				);
			}
		}
		assert.throws(
			() => compile(body, { experimental: { customRenderer: true } }),
			/(?:element_invalid_closing_tag_autoclosed|void_element_invalid_content)/
		);
	}
});

it('does not leak parser warnings from an unused parsing mode', () => {
	const seen: string[] = [];
	const { warnings } = compile(
		'<script unknown></script><p><div /></p><svelte:options customRenderer="some-renderer" />',
		{
			experimental: { customRenderer: true },
			warningFilter(warning) {
				seen.push(warning.code);
				return true;
			}
		}
	);
	assert.deepEqual(seen, ['script_unknown_attribute']);
	assert.deepEqual(
		warnings.map((warning) => warning.code),
		seen
	);
});

it('resolves the renderer callback once, unless overridden by component options', () => {
	let calls = 0;
	const options: CompileOptions = {
		filename: 'Component.svelte',
		experimental: {
			customRenderer({ filename }) {
				assert.equal(filename, 'Component.svelte');
				calls++;
				return 'some-renderer';
			}
		}
	};
	compile('<input><label /></input>', options);
	assert.equal(calls, 1);
	for (const head of [
		'<svelte:options customRenderer="other-renderer" />',
		'<svelte:options customRenderer={null} />'
	]) {
		compile(head + '<br />', options);
		compile('<br />' + head, options);
	}
	assert.equal(calls, 1);
});

it.each([
	'<!-- <svelte:options customRenderer="some-renderer" /> -->',
	`<script>const options = '<svelte:options customRenderer="some-renderer" />';</script>`,
	`<div data-options='<svelte:options customRenderer="some-renderer" />'></div>`
])('does not mistake text for a renderer option: %s', (prefix) => {
	assert.throws(
		() => compile(prefix + '<p><div /></p>', { experimental: { customRenderer: true } }),
		/element_invalid_closing_tag_autoclosed/
	);
});

it('requires explicit closing tags for non-self-closing custom renderer elements', () => {
	const head = '<svelte:options customRenderer="some-renderer" />';
	assert.throws(
		() => compile(head + '<group><label></group>', { experimental: { customRenderer: true } }),
		/element_invalid_closing_tag/
	);
	assert.throws(
		() => compile(head + '<input>', { experimental: { customRenderer: true } }),
		/element_unclosed/
	);
	assert.deepEqual(compile('<br>', { experimental: { customRenderer: true } }).warnings, []);
});

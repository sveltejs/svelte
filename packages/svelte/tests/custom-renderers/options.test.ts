import { assert, describe, it } from 'vitest';
import { compile } from 'svelte/compiler';

const enabled = { generate: 'client', experimental: { customRenderer: 'my-renderer' } } as const;

describe('customRenderer option parsing', () => {
	const valid: Array<[string, string]> = [
		['null', '<svelte:options customRenderer={null} />'],
		['string', '<svelte:options customRenderer="my-renderer" />'],
		['string literal', '<svelte:options customRenderer={"my-renderer"} />']
	];

	for (const [name, source] of valid) {
		it(`accepts ${name}`, () => {
			assert.doesNotThrow(() => compile(source, enabled));
		});
	}

	const invalid: Array<[string, string]> = [
		['true', '<svelte:options customRenderer={true} />'],
		['false', '<svelte:options customRenderer={false} />'],
		['bare', '<svelte:options customRenderer />'],
		['identifier', '<svelte:options customRenderer={renderer} />'],
		['call expression', '<svelte:options customRenderer={get()} />'],
		['template literal', '<svelte:options customRenderer={`x`} />'],
		['mixed text', '<svelte:options customRenderer="a{b}" />'],
		['numeric literal', '<svelte:options customRenderer={42} />'],
		['object literal', '<svelte:options customRenderer={{}} />'],
		['undefined', '<svelte:options customRenderer={undefined} />']
	];

	for (const [name, source] of invalid) {
		it(`rejects ${name}`, () => {
			assert.throws(() => compile(source, enabled), /svelte_options_invalid_attribute_value/);
		});
	}
});

describe('customRenderer function resolver validation', () => {
	const invalid: Array<[string, unknown]> = [
		['number', () => 42],
		['true', () => true],
		['false', () => false],
		['object', () => ({})]
	];

	for (const [name, resolver] of invalid) {
		it(`rejects a resolver returning ${name}`, () => {
			assert.throws(
				() =>
					compile('<div></div>', {
						generate: 'client',
						// @ts-expect-error intentionally invalid return value
						experimental: { customRenderer: resolver }
					}),
				/customRenderer/
			);
		});
	}

	const valid: Array<[string, unknown]> = [
		['string', () => 'my-renderer'],
		['null', () => null],
		['undefined', () => undefined]
	];

	for (const [name, resolver] of valid) {
		it(`accepts a resolver returning ${name}`, () => {
			assert.doesNotThrow(() =>
				compile('<div></div>', {
					generate: 'client',
					// @ts-expect-error resolver typed loosely for the test table
					experimental: { customRenderer: resolver }
				})
			);
		});
	}
});

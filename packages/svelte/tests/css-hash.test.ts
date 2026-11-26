import { assert, describe, it } from 'vitest';
import { compile } from 'svelte/compiler';

const source = '<div class="foo"></div><style>.foo { color: red; }</style>';

describe('cssHash', () => {
	const valid = ['svelte-xyz', 'foo', '_foo', '-foo', '--foo', 'föö', 'a1-b_2'];

	for (const name of valid) {
		it(`accepts "${name}"`, () => {
			const { css } = compile(source, { cssHash: () => name });
			assert.include(css?.code, `.foo.${name}`);
		});
	}

	const invalid: Array<[string, unknown]> = [
		['a leading digit', '2nhsez'],
		['a hyphen and a leading digit', '-2nhsez'],
		['a lone hyphen', '-'],
		['an empty string', ''],
		['a space', 'svelte xyz'],
		['a dot', 'svelte.xyz'],
		['a non-string', false]
	];

	for (const [description, name] of invalid) {
		it(`rejects a class name with ${description}`, () => {
			assert.throws(
				() => compile(source, { cssHash: () => name as string }),
				/^Invalid compiler option: cssHash/
			);
		});
	}

	it('does not call cssHash without a <style> block', () => {
		assert.doesNotThrow(() => compile('<div></div>', { cssHash: () => '2nhsez' }));
	});
});

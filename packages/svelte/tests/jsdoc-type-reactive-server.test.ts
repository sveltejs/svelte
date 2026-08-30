import { parse } from 'acorn';
import { assert, describe, it } from 'vitest';
import { compile } from 'svelte/compiler';

const source = `<script>
	/** @type {string} */
	export let a = 'x';
	$: c = a;
</script>

{c}
`;

describe('server codegen with @type JSDoc and reactive declaration', () => {
	it('emits parseable JavaScript', () => {
		const { js } = compile(source, {
			generate: 'server',
			filename: 'MinRepro.svelte'
		});

		assert.ok(!/let \/\*\* @type \{string\} \*\/ \(/.test(js.code), js.code);
		parse(js.code, { ecmaVersion: 'latest', sourceType: 'module' });
	});
});

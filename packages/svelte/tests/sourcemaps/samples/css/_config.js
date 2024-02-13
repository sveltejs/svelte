import { test } from '../../test';

export default test({
	skip: true, // TODO no template mappings
	client: ['foo'],
	css: [{ str: '.foo', strGenerated: '.foo.svelte-sg04hs' }]
});

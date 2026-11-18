import { test } from '../../test';

export default test({
	// an inherited `css: 'injected'` (e.g. set by vite-plugin-svelte) doesn't apply to
	// custom renderer components: the styles aren't injected, but scoping still works
	compileOptions: {
		css: 'injected'
	},
	test({ assert, target, serialize }) {
		assert.match(serialize(target), /^<p class="svelte-[a-z0-9]+">hello<\/p>$/);
	}
});

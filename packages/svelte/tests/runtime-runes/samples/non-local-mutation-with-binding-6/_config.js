import { flushSync } from 'svelte';
import { test } from '../../test';

// Tests that nested snippets preserve correct component function context so we don't get false positive warnings
export default test({
	html: `<button>0</button>`,

	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>1</button>`);
		assert.deepEqual(warnings, []);
	},

	warnings: []
});

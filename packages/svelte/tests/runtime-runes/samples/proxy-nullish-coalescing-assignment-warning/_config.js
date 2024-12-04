import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<button>items: null</button>`,

	test({ assert, target, warnings }) {
		const btn = target.querySelector('button');

		flushSync(() => btn?.click());
		assert.htmlEqual(target.innerHTML, `<button>items: []</button>`);

		flushSync(() => btn?.click());
		assert.htmlEqual(target.innerHTML, `<button>items: [0]</button>`);

		assert.deepEqual(warnings, [
			'Assignment to `items` property (main.svelte:5:24) will evaluate to the right-hand side, not the value of `items` following the assignment. This may result in unexpected behaviour.'
		]);
	}
});

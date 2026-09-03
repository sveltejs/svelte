import { test } from '../../test';
import { items } from './data.js';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<p>child</p>`,

	test({ assert, instance }) {
		// ensure component instance doesn't get proxified (https://github.com/sveltejs/svelte/issues/18416)
		assert.ok(instance.get_first().myArr === items);
	}
});

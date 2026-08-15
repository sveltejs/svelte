import { test } from '../../test';
import { items } from './data.js';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<p>child</p>`,

	test({ assert, instance }) {
		// same as bind-this-component-in-state, but in dev mode: the two
		// must agree (https://github.com/sveltejs/svelte/issues/18416)
		assert.ok(instance.get_first().myArr === items);
	}
});

import { flushSync } from 'svelte';
import { test } from '../../test';

const data = {
	message: 'hello'
};

export default test({
	get props() {
		data.message = 'hello';

		return {
			data
		};
	},

	html: '<p>hello</p>',

	test({ assert, component, target }) {
		data.message = 'goodbye';
		component.$set({ data });
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p>goodbye</p>');
	}
});

import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<p>caught: error (hello)</p>',
	transformError: () => {
		return 'error';
	},

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>caught: error (hello)</p>');
	}
});

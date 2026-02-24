import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate', 'async-server', 'client'],
	ssrHtml: '<p>caught: error (hello)</p>',
	transformError: () => {
		return Promise.resolve('error');
	},

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>caught: error (hello)</p>');
	}
});

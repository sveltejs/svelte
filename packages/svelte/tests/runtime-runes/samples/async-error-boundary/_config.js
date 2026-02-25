import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate', 'async-server', 'client'],
	ssrHtml: '<p>caught: error</p>',
	transformError: (error) => {
		if (error !== 'catch me') throw 'wrong error object';
		return 'error';
	},

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>caught: error</p>');
	}
});

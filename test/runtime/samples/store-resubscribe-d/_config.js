import { writable } from 'svelte/store';

export default {
	html: '31',
	async test({ assert, component, target, window }) {
		component.store = undefined;

		assert.htmlEqual(target.innerHTML, 'undefined');
		
		component.store = writable(42);
		assert.htmlEqual(target.innerHTML, '42');
	}
};

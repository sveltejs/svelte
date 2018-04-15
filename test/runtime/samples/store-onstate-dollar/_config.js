import { Store } from '../../../../store.js';

const store = new Store({
	name: 'world'
});

export default {
	store,

	html: `<h1>Hello world!</h1>`,

	dev: true,

	test(assert, component) {
		const names = [];

		component.on('state', ({ current }) => {
			names.push(current.$name);
		});

		store.set({ name: 'everybody' });

		assert.deepEqual(names, ['everybody']);
	}
};
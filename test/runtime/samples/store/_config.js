import { Store } from '../../../../store.js';

const store = new Store({
	name: 'world'
});

export default {
	store,

	html: `<h1>Hello world!</h1>`,

	test(assert, component, target) {
		store.set({ name: 'everybody' });

		assert.htmlEqual(target.innerHTML, `<h1>Hello everybody!</h1>`);
	}
};
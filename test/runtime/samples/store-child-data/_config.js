import { Store } from '../../../../store.js';

const store = new Store({
	selectedIndex: 0,
	items: [{ title: 'One' }, { title: 'Two' }]
});

export default {
	store,

	html: `
		<h1>One</h1>
	`,

	test(assert, component, target, window) {
		store.set({ selectedIndex: 2, items: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]});

		assert.htmlEqual(target.innerHTML, `
			<h1>Three</h1>
		`);
	}
};
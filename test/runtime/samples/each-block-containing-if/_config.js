export default {
	test({ assert, component, target }) {
		const items = component.items;
		items.forEach((item) => (item.completed = false));

		component.currentFilter = 'all';

		assert.htmlEqual(
			target.innerHTML,
			`
			<ul><li>one</li><li>two</li><li>three</li></ul>
		`
		);
	}
};

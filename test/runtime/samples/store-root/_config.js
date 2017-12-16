export default {
	store: true, // TODO remove this in v2

	html: `
		<h1>Hello world!</h1>
		<p>It's nice to see you, world.</p>
	`,

	test(assert, component, target) {
		component.store.set({ name: 'everybody' });

		assert.htmlEqual(target.innerHTML, `
			<h1>Hello everybody!</h1>
			<p>It's nice to see you, everybody.</p>
		`);
	}
};

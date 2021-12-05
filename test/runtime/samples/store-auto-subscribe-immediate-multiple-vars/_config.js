export default {
	html: `
		<p>42</p>
	`,

	async test({ assert, component }) {
		assert.equal(component.initial_foo, 42);
	}
};

export default {
	html: `
		<p>override default slot</p>
	`,

	test(assert, component) {
		component.refs.nested.set({ foo: 'b' });
	}
};

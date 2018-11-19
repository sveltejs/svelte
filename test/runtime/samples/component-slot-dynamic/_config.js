export default {
	html: `
		<p>override default slot</p>
	`,

	test(assert, component) {
		component.nested.set({ foo: 'b' });
	}
};

export default {
	html: `
		<p>override default slot</p>
	`,

	test({ component }) {
		component.nested.foo = 'b';
	}
};

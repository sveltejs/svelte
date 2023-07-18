export default {
	html: `
		<ul><li>foo</li><li>bar</li><li>baz</li></ul>
	`,

	get props() {
		return { components: ['foo', 'bar', 'baz'] };
	}
};

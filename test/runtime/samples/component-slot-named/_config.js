export default {
	html: `
		<div>
			<slot>Hello</slot>
			<slot name='bar'><p slot='bar'>bar</p></slot>
			<slot name='foo'><p slot='foo'>foo</p></slot>
		</div>
	`,

	test(assert, component) {
		assert.htmlEqual(component.refs.nested.slots.default.innerHTML, 'Hello');
		assert.htmlEqual(component.refs.nested.slots.foo.innerHTML, `<p slot='foo'>foo</p>`);
		assert.htmlEqual(component.refs.nested.slots.bar.innerHTML, `<p slot='bar'>bar</p>`);
	}
};

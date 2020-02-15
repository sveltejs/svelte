export default {
	immutable: true,

	html: `<div><h3>Called 1 times.</h3></div>`,

	test({ assert, component, target }) {
		// eslint-disable-next-line no-self-assign
		component.foo = component.foo;
		assert.htmlEqual(target.innerHTML, `<div><h3>Called 1 times.</h3></div>`);
	}
};

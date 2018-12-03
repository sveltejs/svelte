export default {
	immutable: true,

	html: `<div><h3>Called 1 times.</h3></div>`,

	ssrHtml: `<div><h3>Called 0 times.</h3></div>`,

	test({ assert, component, target, window }) {
		var nested = component.nested;

		assert.htmlEqual(target.innerHTML, `<div><h3>Called 1 times.</h3></div>`);

		nested.foo = nested.foo;
		assert.htmlEqual(target.innerHTML, `<div><h3>Called 1 times.</h3></div>`);
	}
};

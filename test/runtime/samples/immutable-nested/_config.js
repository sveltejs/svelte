export default {
	immutable: true,
	html: `<div><h3>Called 0 times.</h3></div>`,

	test(assert, component, target, window) {
		var nested = component.refs.nested;
		nested.observe('foo', foo => {
			nested.set({ count: nested.get('count') + 1 });
		});

		assert.htmlEqual(target.innerHTML, `<div><h3>Called 1 times.</h3></div>`);

		nested.set({ foo: nested.get('foo') });
		assert.htmlEqual(target.innerHTML, `<div><h3>Called 1 times.</h3></div>`);
	}
};

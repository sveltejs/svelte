export default {
	immutable: true,
	html: `<div><h3>Called 0 times.</h3></div>`,

	test(assert, component, target, window) {
		component.on('state', ({ changed }) => {
			if (changed.foo) {
				component.set({ count: component.get().count + 1 });
			}
		});

		assert.htmlEqual(target.innerHTML, `<div><h3>Called 0 times.</h3></div>`);

		component.set({ foo: component.get().foo });
		assert.htmlEqual(target.innerHTML, `<div><h3>Called 0 times.</h3></div>`);
	}
};

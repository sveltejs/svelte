export default {
	data: {
		x: true
	},

	html: `
		<p>parent green</p>
		<p>green green</p>
	`,

	test(assert, component, target) {
		// TODO replace this with component.set({ foo: undefined }) post-#1488
		// component.set({ foo: undefined });
		// delete component._state.foo;

		component.set({
			x: false,
			foo: undefined
		});

		assert.htmlEqual(target.innerHTML, `
			<p>parent red</p>
			<p>red red</p>
		`);

		component.set({
			x: true,
			foo: undefined
		});

		assert.htmlEqual(target.innerHTML, `
			<p>parent green</p>
			<p>green green</p>
		`);
	}
};
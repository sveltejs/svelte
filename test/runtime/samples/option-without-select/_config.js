export default {
	props: {
		foo: 'hello'
	},

	html: `<option value='hello'>hello</option>`,

	test(assert, component, target) {
		component.set({ foo: 'goodbye' });
		assert.htmlEqual(target.innerHTML, `
			<option value='goodbye'>goodbye</option>
		`);
	}
};
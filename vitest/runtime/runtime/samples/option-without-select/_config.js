export default {
	get props() {
		return { foo: 'hello' };
	},

	html: "<option value='hello'>hello</option>",

	test({ assert, component, target }) {
		component.foo = 'goodbye';
		assert.htmlEqual(
			target.innerHTML,
			`
			<option value='goodbye'>goodbye</option>
		`
		);
	}
};

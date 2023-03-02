export default {
	props: {
		foo: 0,
		bar: 0
	},

	html: `
		<button>click me</button>
		<p>foo: 0</p>
		<p>bar: 0</p>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);

		assert.equal(component.foo, 4);
		assert.equal(component.bar, 2);

		assert.htmlEqual(target.innerHTML, `
			<button>click me</button>
			<p>foo: 4</p>
			<p>bar: 2</p>
		`);
	}
};

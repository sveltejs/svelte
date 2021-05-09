// updated props in the middle of transitions
// and cancelled the transition halfway
// with spreaded props

export default {
	html: `
		<div>outside Foo Foo Foo</div>
		<div>inside Foo Foo Foo</div>
		<div>inside Foo Foo XXX</div>
	`,
	props: {
		props: 'Foo'
	},

	async test({ assert, component, target, window, raf }) {
		await component.hide();
		const [, div] = target.querySelectorAll('div');

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		component.props = 'Bar';
		assert.htmlEqual(target.innerHTML, `
			<div>outside Bar Bar Bar</div>
			<div>inside Foo Foo Foo</div>
			<div>inside Foo Foo XXX</div>
		`);

		await component.show();

		assert.htmlEqual(target.innerHTML, `
			<div>outside Bar Bar Bar</div>
			<div>inside Bar Bar Bar</div>
			<div>inside Bar Bar XXX</div>
		`);

		raf.tick(100);
		assert.equal(div.foo, 1);
	}
};

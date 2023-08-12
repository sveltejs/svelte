// updated props in the middle of transitions
// and cancelled the transition halfway
// + spreaded props + overflow context

export default {
	html: `
		<div>outside Foo Foo Foo</div>
		<div>inside Foo Foo Foo</div>
		0
	`,
	get props() {
		return { props: 'Foo' };
	},

	async test({ assert, component, target, raf }) {
		await component.hide();
		const [, div] = target.querySelectorAll('div');

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		component.props = 'Bar';
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>outside Bar Bar Bar</div>
			<div>inside Foo Foo Foo</div>
			0
		`
		);

		await component.show();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>outside Bar Bar Bar</div>
			<div>inside Bar Bar Bar</div>
			0
		`
		);

		raf.tick(100);
		assert.equal(div.foo, 1);
	}
};

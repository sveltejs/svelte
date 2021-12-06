// cancelled the transition halfway
export default {
	html: `
		<div>Foo</div>
	`,

	async test({ assert, component, target, raf }) {
		await component.hide();
		const div = target.querySelector('div');

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		await component.show();

		assert.htmlEqual(target.innerHTML, '<div>Bar</div>');

		raf.tick(75);
		assert.equal(div.foo, 0.75);

		raf.tick(100);
		assert.equal(div.foo, 1);
	}
};

export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		let div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);

		component.visible = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 0);

		component.visible = true;
		div = target.querySelector('div');
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);

		raf.tick(300);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);
	}
};

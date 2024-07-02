export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		let div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);
		assert.isUndefined(div.bar);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);
		assert.isUndefined(div.bar);

		component.visible = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
		assert.equal(div.foo, 1);
		assert.equal(div.bar, 0);

		component.visible = true;
		div = target.querySelector('div');
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 0);
		assert.isUndefined(div.bar);

		raf.tick(300);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.equal(div.foo, 1);
		assert.isUndefined(div.bar);
	}
};

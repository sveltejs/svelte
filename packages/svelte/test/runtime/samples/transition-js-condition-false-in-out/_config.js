export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		let div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);
		assert.isUndefined(div.bar);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);
		assert.isUndefined(div.bar);

		component.visible = false;
		assert.htmlEqual(target.innerHTML, '');
		assert.isUndefined(div.foo);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
		assert.isUndefined(div.foo);
		assert.isUndefined(div.bar);

		component.visible = true;
		div = target.querySelector('div');
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);
		assert.isUndefined(div.bar);

		raf.tick(300);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);
		assert.isUndefined(div.bar);
	}
};

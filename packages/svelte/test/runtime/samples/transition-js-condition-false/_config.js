export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		let div = target.querySelector('div');

		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);

		component.visible = false;
		assert.htmlEqual(target.innerHTML, '');
		assert.isUndefined(div.foo);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
		assert.isUndefined(div.foo);

		component.visible = true;
		div = target.querySelector('div');
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);

		raf.tick(300);
		assert.htmlEqual(target.innerHTML, '<div></div>');
		assert.isUndefined(div.foo);
	}
};

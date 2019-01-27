export default {
	props: {
		x: false,
		y: true
	},

	test({ assert, component, target, window, raf }) {
		component.x = true;

		let div = target.querySelector('div');
		assert.equal(div.foo, undefined);

		component.y = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		div = target.querySelector('div');

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '');

		component.x = false;
		component.y = true;
		assert.htmlEqual(target.innerHTML, '');

		component.x = true;
		assert.htmlEqual(target.innerHTML, '<div></div>');
		div = target.querySelector('div');

		component.y = false;
		assert.htmlEqual(target.innerHTML, '<div></div>');

		raf.tick(120);
		assert.equal(div.foo, 0.8);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
	},
};

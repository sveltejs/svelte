export default {
	test({ assert, component, target, raf }) {
		component.visible = true;
		let div = target.querySelector('div');
		assert.equal(div.foo, 0);

		raf.tick(200);
		assert.equal(div.foo, 0.5);

		raf.tick(400);
		assert.equal(div.foo, 1);

		raf.tick(500);
		assert.equal(div.foo, 1);

		component.visible = false;
		raf.tick(600);
		assert.equal(div.foo, 1);
		assert.equal(div.bar, 0.75);

		raf.tick(900);
		assert.equal(div.foo, 1);
		assert.equal(div.bar, 0);

		// test outro before intro complete
		raf.tick(1000);
		component.visible = true;
		div = target.querySelector('div');

		raf.tick(1200);
		assert.equal(div.foo, 0.5);

		component.visible = false;
		raf.tick(1300);
		assert.equal(div.foo, 0.75);
		assert.equal(div.bar, 0.75);

		raf.tick(1400);
		assert.equal(div.foo, 1);
		assert.equal(div.bar, 0.5);

		raf.tick(2000);
	}
};

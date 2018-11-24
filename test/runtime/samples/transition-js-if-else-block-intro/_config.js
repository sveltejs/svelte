export default {
	intro: true,

	test({ assert, component, target, window, raf }) {
		assert.equal(target.querySelector('div'), component.no);
		assert.equal(component.no.foo, 0);

		raf.tick(200);
		assert.equal(component.no.foo, 0.5);

		raf.tick(500);
		component.x = true;
		assert.equal(component.no, undefined);
		assert.equal(component.yes.foo, 0);

		raf.tick(700);
		assert.equal(component.yes.foo, 0.5);

		raf.tick(1000);
	}
};
export default {
	get props() {
		return { z: 'z' };
	},

	test({ assert, component, target, raf }) {
		assert.equal(target.querySelector('div'), component.no);

		component.x = true;

		raf.tick(25);
		assert.equal(component.yes.foo, undefined);
		assert.equal(component.no, null);

		raf.tick(75);
		assert.equal(component.yes.foo, undefined);
		assert.equal(component.no, null);

		raf.tick(100);
	}
};

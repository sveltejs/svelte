import { test } from '../../test';

export default test({
	get props() {
		return { x: false, y: true };
	},

	test({ assert, component, target, raf }) {
		assert.equal(target.querySelector('div'), component.no);

		component.x = true;
		component.y = false;

		raf.tick(25);
		assert.equal(component.yes.foo, undefined);
		assert.equal(component.no.foo, 0.75);

		raf.tick(75);
		assert.equal(component.yes.foo, undefined);
		assert.equal(component.no.foo, 0.25);

		raf.tick(100);
	}
});

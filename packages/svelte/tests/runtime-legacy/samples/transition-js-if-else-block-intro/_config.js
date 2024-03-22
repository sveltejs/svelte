import { test } from '../../test';

export default test({
	intro: true,

	test({ assert, component, target, raf }) {
		assert.equal(target.querySelector('div'), component.no);

		raf.tick(0);
		assert.equal(component.no.foo, 0);

		raf.tick(200);
		assert.equal(component.no.foo, 0.5);

		raf.tick(500);
		component.x = true;
		assert.equal(component.no, null);
		assert.equal(component.yes.foo, 0);

		raf.tick(700);
		assert.equal(component.yes.foo, 0.5);

		raf.tick(1000);
	}
});

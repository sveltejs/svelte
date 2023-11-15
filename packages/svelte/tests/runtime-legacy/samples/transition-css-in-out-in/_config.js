import { ok, test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		ok(div);

		assert.equal(div.style.opacity, '0');

		raf.tick(50);
		component.visible = false;

		// both in and out styles
		assert.equal(div.style.opacity, '0.49998000000000004');

		raf.tick(75);
		component.visible = true;

		// reset original styles
		assert.equal(div.style.opacity, '1');
	}
});

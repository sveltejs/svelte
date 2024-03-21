import { ok, test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		ok(div);

		assert.equal(div.style.scale, '0');

		raf.tick(50);
		component.visible = false;

		// both in and out styles
		assert.equal(div.style.scale, '0.5');
		assert.equal(div.style.opacity, '1');
		assert.equal(div.style.rotate, '360deg');

		raf.tick(75);

		assert.equal(div.style.scale, '0.75'); // intro continues while outro plays
		assert.equal(div.style.opacity, '0.75');
		assert.equal(div.style.rotate, '270deg');

		component.visible = true;

		// reset original styles
		assert.equal(div.style.scale, '0');
		assert.equal(div.style.opacity, '1');
		assert.equal(div.style.rotate, '360deg');
	}
});

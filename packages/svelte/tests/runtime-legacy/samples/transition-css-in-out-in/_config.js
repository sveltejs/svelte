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
		// these numbers look wrong because they're not lerped... maybe we should fix that
		assert.equal(div.style.scale, '0.8333333333333334'); // intro continues while outro plays
		assert.equal(div.style.opacity, '0.8333333333333334');
		assert.equal(div.style.rotate, '300deg');

		component.visible = true;

		assert.equal(div.style.scale, '0.8333333333333334');
		// reset original styles
		assert.equal(div.style.opacity, '1');
		assert.equal(div.style.rotate, '360deg');
	}
});

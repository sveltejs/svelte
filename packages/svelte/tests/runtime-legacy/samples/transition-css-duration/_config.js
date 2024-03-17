import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		ok(div);

		raf.tick(50);
		assert.equal(div.style.opacity, '0.5');

		component.visible = false;

		raf.tick(75);
		assert.equal(div.style.opacity, '0.25');
	}
});

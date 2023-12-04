import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target, raf }) {
		component.visible = true;
		const div = target.querySelector('div');
		ok(div);

		raf.tick(25);

		assert.equal(div.style.opacity, '0.16666');

		component.visible = false;

		raf.tick(40);

		assert.ok(div.style.opacity === '0');
	}
});

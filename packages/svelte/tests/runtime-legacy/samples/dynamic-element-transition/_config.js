import { ok, test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;
		const h1 = target.querySelector('h1');
		ok(h1);
		raf.tick(0);
		assert.equal(h1.style.opacity, '0');

		raf.tick(150);
		component.tag = 'h2';
		const h2 = target.querySelector('h2');
		ok(h2);
		assert.equal(h1.style.opacity, '');
		assert.equal(h2.style.opacity, '');

		raf.tick(200);
		component.visible = false;
		raf.tick(250);
		assert.equal(h2.style.opacity, '0.5');
	}
});

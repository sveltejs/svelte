import { test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;

		raf.tick(0);

		const div = /** @type {HTMLDivElement & { value: any }} */ (target.querySelector('div'));

		assert.equal(div.value, 0);

		raf.tick(200);

		div.value = 'test';
		component.visible = false;
		assert.equal(div.value, 'test');
	}
});

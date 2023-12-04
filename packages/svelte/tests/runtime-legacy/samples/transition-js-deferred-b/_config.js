import { test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;

		return Promise.resolve().then(() => {
			const div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('.foo'));

			raf.tick(0);

			assert.equal(div.foo, 0);

			raf.tick(50);
			assert.equal(div.foo, 0.5);
			raf.tick(100);
		});
	}
});

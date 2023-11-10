import { test } from '../../test';

export default test({
	test({ assert, component, target, raf }) {
		component.visible = true;

		return Promise.resolve().then(() => {
			raf.tick(0);

			const [, div] = target.querySelectorAll('div');
			// @ts-ignore
			assert.equal(div.foo, 0);

			raf.tick(50);
			// @ts-ignore
			assert.equal(div.foo, 0.5);
		});
	}
});

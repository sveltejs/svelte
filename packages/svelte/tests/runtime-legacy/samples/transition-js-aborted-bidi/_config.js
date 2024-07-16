import { test } from '../../test';

export default test({
	get props() {
		return { visible: false };
	},

	test({ assert, component, target, raf, logs }) {
		component.visible = true;
		const span = /** @type {HTMLSpanElement & { foo: number }} */ (target.querySelector('span'));

		raf.tick(50);
		assert.equal(span.foo, 0.5);

		component.visible = false;
		assert.equal(span.foo, 0.5);

		raf.tick(75);
		assert.equal(span.foo, 0.25);

		component.visible = true;
		raf.tick(100);
		assert.equal(span.foo, 0.5);

		assert.deepEqual(logs, ['transition']); // should only run once
	}
});

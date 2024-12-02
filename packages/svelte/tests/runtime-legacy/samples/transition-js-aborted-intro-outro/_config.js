import { test } from '../../test';

export default test({
	get props() {
		return { visible: false };
	},

	test({ assert, component, target, raf, logs }) {
		component.visible = true;
		const span = /** @type {HTMLSpanElement & { foo: number, bar: number }} */ (
			target.querySelector('span')
		);

		raf.tick(50);
		assert.equal(span.foo, 0.5);

		component.visible = false;
		assert.equal(span.foo, 0.5);

		raf.tick(75);
		assert.equal(span.foo, 0.75);
		assert.equal(span.bar, 0.75);

		component.visible = true;
		raf.tick(100);
		assert.equal(span.foo, 0.25);
		assert.equal(span.bar, 1);

		assert.deepEqual(logs, ['in', 'out', 'in']);
	}
});

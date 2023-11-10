import { test } from '../../test';

export default test({
	get props() {
		return { visible: true };
	},

	test({ assert, component, target, raf }) {
		component.visible = false;
		const div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		component.$destroy();

		raf.tick(100);
	}
});

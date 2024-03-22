import { test } from '../../test';

export default test({
	get props() {
		return { visible: true };
	},

	test({ assert, component, target, raf }) {
		component.visible = false;

		raf.tick(150);

		const outer = /** @type {HTMLSpanElement} */ (target.querySelector('.outer'));
		const inner = /** @type {HTMLSpanElement} */ (target.querySelector('.inner'));

		assert.deepEqual([outer.style.cssText, inner.style.cssText], ['opacity: 0.25;', '']);
	}
});

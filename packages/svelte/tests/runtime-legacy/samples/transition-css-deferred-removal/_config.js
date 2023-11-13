import { ok, test } from '../../test';

export default test({
	get props() {
		return { visible: true };
	},

	test({ assert, component, target, raf }) {
		component.visible = false;

		const outer = /** @type {HTMLSpanElement} */ (target.querySelector('.outer'));
		const inner = /** @type {HTMLSpanElement} */ (target.querySelector('.inner'));

		raf.tick(150);

		assert.deepEqual(
			[outer.style.cssText, inner.style.cssText],
			['opacity: 0.24999000000000002;', '']
		);
	}
});

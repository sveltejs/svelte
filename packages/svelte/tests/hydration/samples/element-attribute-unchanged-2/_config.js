import { test } from '../../test';

/** @type {any} */
let orig;

export default test({
	// This looks a bit weird, but it's the only way to test that an attribute is not
	// reset to a value it already has during hydration.
	before_test() {
		orig = Element.prototype.setAttribute;
		Element.prototype.setAttribute = function () {
			const stack = new Error().stack;
			if (stack?.includes('render.js')) {
				throw new Error('setAttribute called during hydration');
			}
			return orig.apply(this, arguments);
		};
	},
	after_test() {
		Element.prototype.setAttribute = orig;
	},
	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div
		};
	}
});

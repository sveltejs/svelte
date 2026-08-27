import { test } from '../../test';

let observers = 0;
const MutationObserver = globalThis.MutationObserver;

export default test({
	before_test() {
		observers = 0;
		globalThis.MutationObserver = class extends MutationObserver {
			/** @param {MutationCallback} callback */
			constructor(callback) {
				super(callback);
				observers++;
			}
		};
	},

	after_test() {
		globalThis.MutationObserver = MutationObserver;
	},

	test({ assert, target }) {
		const selects = target.querySelectorAll('select');
		for (const select of selects) {
			assert.equal(select.selectedIndex, 0);
			assert.equal(select.options[1].defaultSelected, true);
		}
		assert.equal(observers, selects.length);
	}
});

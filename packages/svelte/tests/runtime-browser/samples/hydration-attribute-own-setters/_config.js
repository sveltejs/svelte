import { assert_ok, test } from '../../assert';

export default test({
	mode: ['hydrate'],

	before_test() {
		for (const [selector, name] of [
			['button', 'disabled'],
			['svg', 'hidden']
		]) {
			const element = document.querySelector(`main ${selector}`);
			assert_ok(element);

			Object.defineProperty(element, name, {
				/** @param {boolean} value */
				set(value) {
					this.setAttribute('data-effect', String(value));
				}
			});
		}
	},

	test({ assert, target }) {
		// an own setter is not the native reflection, so it still runs
		assert.equal(target.querySelector('button')?.getAttribute('data-effect'), 'true');
		assert.equal(target.querySelector('svg')?.getAttribute('data-effect'), 'true');
	}
});

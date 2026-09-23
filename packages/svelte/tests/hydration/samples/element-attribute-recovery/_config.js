import { flushSync } from 'svelte';
import { test } from '../../test';

/** @type {MutationObserver} */
let observer;

export default test({
	before_test() {
		observer = new MutationObserver(() => {});
		observer.observe(document.body, { attributes: true, subtree: true });
	},

	test(assert, target, snapshot, component) {
		// the mismatched branch is created outside of hydration, which then resumes for the `<p>`
		const written = observer
			.takeRecords()
			.map((record) => `${record.target.nodeName.toLowerCase()} ${record.attributeName}`);
		assert.ok(!written.includes('p data-n'));

		const div = target.querySelector('div');
		assert.equal(div?.getAttribute('data-n'), '1');
		assert.equal(div?.getAttribute('tabindex'), '-1');

		flushSync(() => (component.n = 2));

		assert.deepEqual(
			observer
				.takeRecords()
				.map((record) => `${record.target.nodeName.toLowerCase()} ${record.attributeName}`),
			['div data-n', 'p data-n']
		);
	},

	after_test() {
		observer.disconnect();
	}
});

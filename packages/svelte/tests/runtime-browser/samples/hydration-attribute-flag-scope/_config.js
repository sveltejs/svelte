import { flushSync } from 'svelte';
import { assert_ok, test } from '../../assert';

/** @type {MutationObserver} */
let observer;

export default test({
	mode: ['hydrate'],

	before_test() {
		const target = document.querySelector('main');
		assert_ok(target);
		observer = new MutationObserver(() => {});
		observer.observe(target, { attributes: true, subtree: true });
	},

	test({ assert, component, target }) {
		/** @param {() => void} fn */
		const written = (fn) => {
			flushSync(fn);
			return observer
				.takeRecords()
				.map(
					(record) =>
						`${record.attributeName} ${/** @type {Element} */ (record.target).getAttribute(/** @type {string} */ (record.attributeName))}`
				);
		};

		// `$effect.pre` runs while hydrating, so only its changed value is written; `$effect` runs
		// after hydration, so its change is written as usual
		assert.deepEqual(
			written(() => {}),
			['data-pre 2', 'data-post 2']
		);

		// after hydration, an unchanged string is still written when the client value was a number
		assert.deepEqual(
			written(() => component.$set({ n: '1' })),
			['data-n 1']
		);

		observer.disconnect();

		assert.htmlEqual(target.innerHTML, '<div data-n="1" data-pre="2" data-post="2"></div>');
	}
});

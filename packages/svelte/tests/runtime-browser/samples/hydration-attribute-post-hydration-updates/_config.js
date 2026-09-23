import { flushSync } from 'svelte';
import { test } from '../../assert';

export default test({
	mode: ['hydrate'],

	test({ assert, component, target }) {
		const observer = new MutationObserver(() => {});
		observer.observe(target, { attributes: true, subtree: true });

		/** @param {() => void} fn */
		const written = (fn) => {
			flushSync(fn);
			return observer.takeRecords().map((record) => record.attributeName);
		};

		// after hydration, writes follow the cached client value, even when the string is unchanged
		assert.deepEqual(
			written(() => (component.index = 2)),
			['aria-rowindex']
		);
		assert.deepEqual(
			written(() => (component.index = 2)),
			[]
		);
		assert.deepEqual(
			written(() => (component.active = false)),
			['data-active']
		);
		assert.deepEqual(
			written(() => (component.spread = { disabled: false, hidden: true })),
			['disabled']
		);
		assert.deepEqual(
			written(() => (component.spread = { disabled: true, hidden: true })),
			['disabled']
		);

		observer.disconnect();

		assert.htmlEqual(
			target.innerHTML,
			'<div aria-rowindex="2" data-active="false"></div> <button disabled hidden>x</button>'
		);
	}
});

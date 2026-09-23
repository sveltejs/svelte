import { flushSync, hydrate, unmount } from 'svelte';
import { assert_ok, test } from '../../assert';

/** @type {string} */
let html;

/** @type {Element | null} */
let server_div;

export default test({
	mode: ['hydrate'],

	options: { recover: true },

	before_test() {
		const main = document.querySelector('main');
		assert_ok(main);

		html = main.innerHTML;
		server_div = main.querySelector('div');

		// without its end marker, hydration throws once the component has been hydrated
		main.lastChild?.remove();
	},

	test({ assert, component, componentCtor, target }) {
		// recovery replaced the hydrated elements with new ones
		assert.equal(target.querySelector('div') === server_div, false);
		assert.htmlEqual(target.innerHTML, '<div data-n="1"></div> <svg width="24"></svg>');

		const observer = new MutationObserver(() => {});
		observer.observe(document.body, { attributes: true, subtree: true });

		// hydration ended despite the failure: while hydrating, an unchanged string isn't written
		flushSync(() => (component.n = '1'));
		assert.deepEqual(
			observer.takeRecords().map((record) => record.attributeName),
			['data-n']
		);

		// and a later hydration skips unchanged values again
		const other = document.createElement('section');
		other.innerHTML = html;
		document.body.append(other);

		const app = hydrate(componentCtor, { target: other, props: { n: 1 } });
		flushSync();
		assert.deepEqual(observer.takeRecords(), []);
		assert.htmlEqual(other.innerHTML, '<div data-n="1"></div> <svg width="24"></svg>');

		unmount(app);
		observer.disconnect();
	}
});

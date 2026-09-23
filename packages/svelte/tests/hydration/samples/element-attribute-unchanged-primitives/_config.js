import { test } from '../../test';

/** @type {MutationObserver} */
let observer;

export default test({
	server_props: { index: 2, gone: 1, hidden: false },
	props: { index: 3, gone: undefined, hidden: true },

	before_test() {
		observer = new MutationObserver(() => {});
		observer.observe(document.body, { attributes: true, subtree: true });
	},

	test(assert) {
		const written = observer
			.takeRecords()
			.map((record) => `${record.target.nodeName.toLowerCase()} ${record.attributeName}`);

		// besides the spread's `disabled` and `hidden` property setters, which always run, only the
		// attributes whose client value differs from the server-rendered one are written
		assert.deepEqual(written.sort(), [
			'button disabled',
			'button hidden',
			'div aria-rowindex',
			'div data-gone'
		]);
	},

	after_test() {
		observer.disconnect();
	}
});

import { test } from '../../test';

/** @type {MutationObserver} */
let observer;

export default test({
	server_props: {
		values: {
			decimal: '1.0',
			zero: '-0',
			same: 1,
			nan: NaN,
			large: 1e21,
			yes: true,
			no: false,
			hidden: true,
			checked: 'False',
			empty: '',
			gone: 1
		}
	},

	props: {
		values: {
			decimal: 1,
			zero: -0,
			same: 1,
			nan: NaN,
			large: 1e21,
			yes: true,
			no: false,
			hidden: true,
			checked: false,
			empty: true,
			gone: null
		}
	},

	before_test() {
		observer = new MutationObserver(() => {});
		observer.observe(document.body, { attributes: true, subtree: true });
	},

	test(assert) {
		const written = observer.takeRecords().map((record) => record.attributeName);

		// only values whose string differs from the server-rendered one are written
		assert.deepEqual(written, [
			'data-decimal',
			'data-zero',
			'aria-checked',
			'data-empty',
			'data-gone'
		]);
	},

	after_test() {
		observer.disconnect();
	}
});

import { flushSync } from 'svelte';
import { test } from '../../test';

let conversions = 0;
const object = { toString: () => String(++conversions) };

/** @type {Record<string, [server: any, client: any, written: boolean]>} */
const values = {
	'data-same': [1, 1, false],
	'data-nan': [NaN, NaN, false],
	'data-large': [1e21, 1e21, false],
	'data-yes': [true, true, false],
	'data-no': [false, false, false],
	'aria-hidden': [true, true, false],
	'data-decimal': ['1.0', 1, true],
	'data-zero': ['-0', -0, true],
	'aria-checked': ['False', false, true],
	'data-empty': ['', true, true],
	'aria-rowindex': [2, 3, true],
	'data-null': [1, null, true],
	'data-undefined': [1, undefined, true],
	'data-object': ['server', object, true]
};

/** @param {number} i */
const pick = (i) =>
	Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value[i]]));

/** @type {MutationObserver} */
let observer;

const written = () =>
	observer
		.takeRecords()
		.map((record) => `${record.target.nodeName.toLowerCase()} ${record.attributeName}`);

export default test({
	server_props: {
		values: pick(0),
		spread: { disabled: true, tabindex: -1, hidden: false },
		show: false
	},

	props: {
		values: pick(1),
		spread: { disabled: true, tabindex: -1, hidden: true },
		show: true
	},

	before_test() {
		observer = new MutationObserver(() => {});
		observer.observe(document.body, { attributes: true, subtree: true });
	},

	test(assert, target, snapshot, component) {
		// spread `disabled` and `hidden` always use their setters
		assert.deepEqual(written(), [
			'button disabled',
			'button hidden',
			...Object.keys(values)
				.filter((key) => values[key][2])
				.map((key) => `div ${key}`)
		]);
		assert.equal(conversions, 1);

		component.$set({ n: 2 });
		flushSync();
		// the mismatched `{#if}` branch was created, then hydration resumed for the `<p>`
		assert.deepEqual(
			written().filter((record) => record.endsWith('data-n')),
			['section data-n', 'p data-n']
		);
	},

	after_test() {
		observer.disconnect();
	}
});

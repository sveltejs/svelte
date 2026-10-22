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
	'data-object': ['server', object, true],
	// a property setter still runs
	draggable: [false, false, true]
};

/** @param {number} i */
const pick = (i) =>
	Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value[i]]));

/** @type {string[]} */
const changes = [];

const custom = { is: 'svelte-observed-button', tabindex: -1, 'data-on': true };

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
		custom,
		show: false
	},

	props: {
		values: pick(1),
		spread: { disabled: true, tabindex: -1, hidden: true },
		custom,
		show: true
	},

	before_test() {
		customElements.get(custom.is) ??
			customElements.define(
				custom.is,
				class extends HTMLButtonElement {
					static observedAttributes = ['tabindex', 'data-on'];

					/**
					 * @param {string} name
					 * @param {string | null} old_value
					 * @param {string | null} value
					 */
					attributeChangedCallback(name, old_value, value) {
						// `htmlEqual` upgrades detached copies
						if (this.isConnected) changes.push(`${name} ${old_value} ${value}`);
					}
				},
				{ extends: 'button' }
			);

		changes.length = 0;
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

		// a customized built-in is called back when it is upgraded, not again for the same value
		assert.deepEqual(changes, ['tabindex null -1', 'data-on null true']);

		component.$set({ n: 2 });
		flushSync();
		// the mismatched `{#if}` branch was created, then hydration resumed for the `<p>`
		assert.deepEqual(
			written().filter((record) => record.endsWith('data-n')),
			['section data-n', 'p data-n']
		);

		// after hydration, a number is written even when its string is unchanged
		component.$set({ n: '2' });
		flushSync();
		written();
		component.$set({ n: 2 });
		flushSync();
		assert.deepEqual(
			written().filter((record) => record.endsWith('data-n')),
			['section data-n', 'p data-n']
		);
	},

	after_test() {
		observer.disconnect();
	}
});

import { flushSync } from 'svelte';
import { assert_ok, test } from '../../assert';

/** @type {string[]} */
const changes = [];

let hydrating = false;

/** @param {string} name */
function define(name) {
	customElements.define(
		name,
		class extends HTMLButtonElement {
			static observedAttributes = ['tabindex', 'data-on'];

			/**
			 * @param {string} attribute
			 * @param {string | null} old_value
			 * @param {string | null} value
			 */
			attributeChangedCallback(attribute, old_value, value) {
				changes.push(`${this.textContent} ${attribute} ${old_value} ${value}`);
			}
		},
		{ extends: 'button' }
	);
}

export default test({
	before_test() {
		// customized built-ins only come from the server markup here
		hydrating = document.querySelector('main')?.firstChild != null;
		/** @type {any} */ (globalThis).svelte_test_client = true;

		// upgrades the server-rendered button before hydration
		define('svelte-early-button');
	},

	test({ assert, component, target }) {
		if (!hydrating) return;

		// the upgrade delivered the initial values, and hydration didn't write them again
		assert.deepEqual(changes.splice(0).sort(), [
			'early data-on null true',
			'early tabindex null -1'
		]);

		// created with hydration turned off, after the `{#if}` mismatch, so its attributes are written
		const recovered = [...target.querySelectorAll('button')].find(
			(button) => button.textContent === 'recovered'
		);
		assert_ok(recovered);
		assert.equal(recovered.getAttribute('tabindex'), '-1');
		assert.equal(recovered.getAttribute('data-on'), 'true');

		// defined after hydration: the upgrade still delivers the initial values
		define('svelte-late-button');
		assert.deepEqual(changes.splice(0).sort(), ['late data-on null true', 'late tabindex null -1']);

		// a changed value is written
		flushSync(() => component.$set({ n: 0 }));
		assert.deepEqual(changes.splice(0).sort(), ['early tabindex -1 0', 'late tabindex -1 0']);
	}
});

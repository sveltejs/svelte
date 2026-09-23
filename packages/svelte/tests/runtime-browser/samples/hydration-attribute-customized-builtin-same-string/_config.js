import { flushSync } from 'svelte';
import { deepEqual, ok, test } from '../../assert';

/** @type {string[]} */
const changes = [];

export default test({
	mode: ['hydrate'],

	before_test() {
		class SameStringButton extends HTMLButtonElement {
			static observedAttributes = ['tabindex', 'aria-rowindex', 'data-state'];

			/** @param {string} name */
			attributeChangedCallback(name) {
				changes.push(name);
			}
		}

		customElements.define('same-string-button', SameStringButton, { extends: 'button' });

		// the server-rendered button was upgraded and reported its existing attributes
		ok(document.querySelector('main button') instanceof SameStringButton);
		deepEqual(changes.sort(), ['aria-rowindex', 'data-state', 'tabindex']);
		changes.length = 0;
	},

	test({ assert, component }) {
		// hydration already skipped unchanged string values before number and boolean values were
		// skipped too, so a customized built-in gets no callback for them
		assert.deepEqual(changes, []);

		// a changed value is still written and observed
		flushSync(() => {
			component.spread = { ...component.spread, 'data-state': 'off' };
		});

		assert.deepEqual(changes, ['data-state']);
	}
});

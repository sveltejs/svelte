import { flushSync } from 'svelte';
import { test } from '../../assert';

const attributes = { disabled: true, hidden: true, tabindex: -1, 'aria-rowindex': 2 };

export default test({
	mode: ['hydrate'],

	props: {
		retained: { is: 'late-button', ...attributes },
		removed: { ...attributes, is: 'late-button' }
	},

	before_test() {
		document.querySelectorAll('main button')[1].removeAttribute('is');
	},

	test({ assert, component }) {
		/** @type {string[]} */
		const changes = [];

		// the definition registers after hydration, so hydration wrote to plain buttons
		customElements.define(
			'late-button',
			class extends HTMLButtonElement {
				static observedAttributes = Object.keys(attributes);

				/**
				 * @param {string} name
				 * @param {string | null} old_value
				 * @param {string | null} value
				 */
				attributeChangedCallback(name, old_value, value) {
					changes.push(`${this.textContent} ${name} ${old_value} ${value}`);
				}
			},
			{ extends: 'button' }
		);

		// upgrading reports every attribute the buttons have, whether or not hydration wrote it
		assert.deepEqual(changes.splice(0).sort(), [
			'removed aria-rowindex null 2',
			'removed disabled null ',
			'removed hidden null ',
			'removed tabindex null -1',
			'retained aria-rowindex null 2',
			'retained disabled null ',
			'retained hidden null ',
			'retained tabindex null -1'
		]);

		flushSync(() => {
			component.retained = { is: 'late-button', ...attributes, tabindex: 0 };
			component.removed = { ...attributes, disabled: false, is: 'late-button' };
		});

		assert.deepEqual(changes.sort(), ['removed disabled  null', 'retained tabindex -1 0']);
	}
});

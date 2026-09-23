import { flushSync } from 'svelte';
import { deepEqual, ok, test } from '../../assert';

/** @type {string[]} */
const changes = [];

const attributes = { disabled: true, hidden: true, tabindex: -1, 'aria-rowindex': 2 };
const retained = { is: 'native-prototype-button', ...attributes };

export default test({
	mode: ['hydrate'],

	props: { retained, removed: { ...attributes, is: 'native-prototype-button' } },

	before_test() {
		class NativePrototypeButton extends HTMLButtonElement {
			static observedAttributes = Object.keys(attributes);

			/** @param {string} name */
			attributeChangedCallback(name) {
				changes.push(`${this.textContent} ${name}`);
			}
		}

		customElements.define('native-prototype-button', NativePrototypeButton, { extends: 'button' });

		const buttons = document.querySelectorAll('main button');

		// the server-rendered buttons were upgraded and reported their existing attributes
		for (const button of buttons) ok(button instanceof NativePrototypeButton);
		deepEqual(changes.length, 8);

		for (const button of buttons) Object.setPrototypeOf(button, HTMLButtonElement.prototype);
		buttons[1].removeAttribute('is');

		changes.length = 0;
	},

	test({ assert, component }) {
		// Documented limitation: an upgraded customized built-in whose prototype was replaced with the
		// native one is compared as a native element, so its unchanged numbers and booleans aren't
		// written and get no callback, like unchanged strings already don't (see
		// hydration-attribute-customized-builtin-same-string). The spread's property setters still run.
		assert.deepEqual(changes.sort(), [
			'removed disabled',
			'removed hidden',
			'retained disabled',
			'retained hidden'
		]);

		// the element is still custom: a changed value is observed
		changes.length = 0;
		flushSync(() => {
			component.retained = { ...retained, tabindex: 0 };
		});

		assert.deepEqual(changes, ['retained tabindex']);
	}
});

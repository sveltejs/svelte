import { assert_ok, test } from '../../assert';

/** @type {string[]} */
const changes = [];

const attributes = { disabled: true, hidden: true, tabindex: -1, 'aria-rowindex': 2 };
const retained = { is: 'observed-button', ...attributes };
// `is` comes last, so the other attributes are hydrated while it is missing
const removed = { ...attributes, is: 'observed-button' };

export default test({
	mode: ['hydrate'],

	server_props: { retained, removed, unset: retained },

	props: { retained, removed, unset: { is: undefined, ...attributes } },

	before_test() {
		customElements.define(
			'observed-button',
			class extends HTMLButtonElement {
				static observedAttributes = Object.keys(attributes);

				/** @param {string} name */
				attributeChangedCallback(name) {
					changes.push(`${this.textContent} ${name}`);
				}
			},
			{ extends: 'button' }
		);

		// removing `is` does not turn an upgraded button back into a plain one
		document.querySelectorAll('button')[1].removeAttribute('is');

		// upgrading the server-rendered buttons reports their existing attributes
		changes.length = 0;
	},

	test({ assert, target }) {
		const buttons = target.querySelectorAll('button');
		assert.equal(buttons.length, 3);

		// an upgraded customized built-in is recognized with or without `is`, so its number and
		// boolean writes are not skipped during hydration
		assert.deepEqual(
			changes.sort(),
			['removed', 'retained', 'unset'].flatMap((button) =>
				['aria-rowindex', 'disabled', 'hidden', 'tabindex'].map((name) => `${button} ${name}`)
			)
		);

		const ObservedButton = customElements.get('observed-button');
		assert_ok(ObservedButton);

		for (const button of buttons) {
			assert_ok(button instanceof ObservedButton);
			assert.equal(button.disabled, true);
			assert.equal(button.hidden, true);
			assert.equal(button.tabIndex, -1);
			assert.equal(button.getAttribute('aria-rowindex'), '2');
		}

		assert.equal(buttons[2].hasAttribute('is'), false);
	}
});

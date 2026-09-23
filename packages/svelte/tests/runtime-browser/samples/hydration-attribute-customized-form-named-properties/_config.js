import { deepEqual, ok, test } from '../../assert';

/** @type {string[]} */
const changes = [];

export default test({
	mode: ['hydrate'],

	props: {
		retained: { is: 'named-form', 'data-n': 1 },
		removed: { 'data-n': 1, is: 'named-form' }
	},

	before_test() {
		class NamedForm extends HTMLFormElement {
			static observedAttributes = ['data-n'];

			/** @param {string} name */
			attributeChangedCallback(name) {
				changes.push(`${this.getAttribute('data-case')} ${name}`);
			}
		}

		customElements.define('named-form', NamedForm, { extends: 'form' });

		// the server-rendered forms were upgraded and reported their existing attribute
		const forms = document.querySelectorAll('main form');
		for (const form of forms) ok(form instanceof NamedForm);
		deepEqual(changes.length, 3);

		forms[1].removeAttribute('is');
		forms[2].removeAttribute('is');
		changes.length = 0;
	},

	test({ assert }) {
		// a shadowed `namespaceURI` or `localName` doesn't make a customized built-in look native
		assert.deepEqual(changes.sort(), ['local-name data-n', 'removed data-n', 'retained data-n']);
	}
});

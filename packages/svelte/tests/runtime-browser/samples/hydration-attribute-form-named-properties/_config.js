import { test } from '../../assert';

/** @type {HTMLInputElement[]} */
let inputs;

export default test({
	mode: ['hydrate'],

	before_test() {
		inputs = [...document.querySelectorAll('main input')].map((input) => {
			const element = /** @type {HTMLInputElement} */ (input);
			element.value = 'typed';
			return element;
		});
	},

	test({ assert, target }) {
		// a form's controls can shadow its `localName` and `namespaceURI`, which still hydrates
		// without recovery, so the server-rendered inputs and their text are kept
		const forms = target.querySelectorAll('form');
		assert.equal(forms.length, 3);

		forms.forEach((form, i) => {
			assert.equal(form.getAttribute('data-n'), '1');
			assert.equal(form.querySelector('input'), inputs[i]);
			assert.equal(inputs[i].value, 'typed');
		});
	}
});

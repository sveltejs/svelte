import { assert_ok, test } from '../../assert';
import { shadowed } from './names.js';

/** @type {HTMLInputElement} */
let input;

export default test({
	mode: ['hydrate'],

	before_test() {
		const element = document.querySelector('main input');
		assert_ok(element instanceof HTMLInputElement);
		input = element;
		input.value = 'typed';

		shadowed.push(/** @type {any} */ (document).createElement.constructor.name);
	},

	test({ assert, target }) {
		// each element's tag is first looked up while the document exposes a named form, then a form
		// and an object, then an object as `document.createElement`
		assert.deepEqual(shadowed, ['HTMLFormElement', 'HTMLCollection', 'HTMLObjectElement']);

		// hydration succeeded without recovery, so the server-rendered input and its text are kept
		assert.equal(target.querySelector('input'), input);
		assert.equal(input.value, 'typed');

		for (const name of ['div', 'p', 'span']) {
			assert.equal(target.querySelector(name)?.getAttribute('data-n'), '1');
		}
	}
});

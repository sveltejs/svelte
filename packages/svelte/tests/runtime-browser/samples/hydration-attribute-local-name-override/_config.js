import { assert_ok, test } from '../../assert';

/** @type {HTMLInputElement} */
let input;

export default test({
	mode: ['hydrate'],

	before_test() {
		const div = document.querySelector('main div');
		const element = document.querySelector('main input');
		assert_ok(div && element instanceof HTMLInputElement);

		input = element;
		input.value = 'typed';

		// no element can have this name
		Object.defineProperty(div, 'localName', { value: 'bad name' });
	},

	test({ assert, target }) {
		// the actual local name is used, so hydration succeeds without recovery and keeps the input
		assert.equal(target.querySelector('div')?.getAttribute('data-n'), '1');
		assert.equal(target.querySelector('input'), input);
		assert.equal(input.value, 'typed');
	}
});

import { test } from '../../test';

const VALUES = Array.from('abcdefghijklmnopqrstuvwxyz');

/** @param {string} array */
function toObjects(array) {
	return array.split('').map((x) => ({ id: x }));
}

function permute() {
	const values = VALUES.slice();
	const number = Math.floor(Math.random() * VALUES.length);
	const permuted = [];
	for (let i = 0; i < number; i++) {
		permuted.push(...values.splice(Math.floor(Math.random() * (number - i)), 1));
	}

	return permuted.join('');
}

export default test({
	get props() {
		return { values: toObjects('abc') };
	},

	html: '(a)(b)(c)',

	test({ assert, component, target }) {
		/** @param {string} sequence */
		function test(sequence) {
			const previous = target.textContent;
			const expected = sequence
				.split('')
				.map((x) => `(${x})`)
				.join('');
			component.values = toObjects(sequence);
			assert.htmlEqual(
				target.innerHTML,
				expected,
				`\n${previous} -> ${expected}\n${target.textContent}`
			);
		}

		// first, some fixed tests so that we can debug them
		test('abc');
		test('abcd');
		test('abecd');
		test('fabecd');
		test('fabed');
		test('beadf');
		test('ghbeadf');
		test('gf');
		test('gc');
		test('g');
		test('');
		test('abc');
		test('duqbmineapjhtlofrskcg');
		test('hdnkjougmrvftewsqpailcb');
		test('bidhfacge');
		test('kgjnempcboaflidh');
		test('fekbijachgd');
		test('kdmlgfbicheja');

		// then, we party
		for (let i = 0; i < 100; i += 1) test(permute());
	}
});

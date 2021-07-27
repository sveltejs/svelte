// `bitmask-overflow-if` tests the case where the if condition is made of first 32 variables
// this tests the case where the if condition is made of the next 32 variables
export default {
	html: `
		012345678910111213141516171819202122232425262728293031323334353637383940
		expected: true
		if: true
	`,

	async test({ assert, component, target }) {
		component._40 = '-';

		assert.htmlEqual(
			target.innerHTML,
			`
			0123456789101112131415161718192021222324252627282930313233343536373839-
			expected: false
			if: false
			<div></div>
		`
		);
	}
};

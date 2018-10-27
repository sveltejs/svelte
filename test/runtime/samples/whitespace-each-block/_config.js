export default {
	data: {
		characters: ['a', 'b', 'c']
	},

	test ( assert, component, target ) {
		assert.equal(
			target.textContent,
			`a b c `
		);
	}
};
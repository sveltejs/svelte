export default {
	data: {
		name: 'world'
	},

	html: `<h1>Hello <strong>world! </strong><span>How are you?</span></h1>`,

	test ( assert, component, target ) {
		assert.equal(
			target.textContent,
			`Hello world! How are you?`
		);
	}
};
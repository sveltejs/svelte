export default {
	skip_if_ssr: true,
	html: `<p>from this.options</p>`,

	options: {
		text: 'from this.options'
	},

	test(assert, component) {
		assert.equal(component.options.text, 'from this.options');
	}
};
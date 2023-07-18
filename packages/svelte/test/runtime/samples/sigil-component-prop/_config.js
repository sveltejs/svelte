export default {
	compileOptions: {
		dev: true
	},
	get props() {
		return { foo: 'foo' };
	},
	html: '<div>foo @ foo # foo</div>'
};

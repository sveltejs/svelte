export default {
	get props() {
		return { props: { 'data-foo': 'bar' } };
	},

	html: '<input data-foo="bar">'
};

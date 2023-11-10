import { test } from '../../test';

export default test({
	get props() {
		return { props: { 'data-foo': 'bar' } };
	},

	html: '<input data-foo="bar">'
});

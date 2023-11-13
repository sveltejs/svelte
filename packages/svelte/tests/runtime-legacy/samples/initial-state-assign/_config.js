import { test } from '../../test';

export default test({
	get props() {
		return { bar: 'bar' };
	},
	html: `
		"foo"
		"bar"
	`
});

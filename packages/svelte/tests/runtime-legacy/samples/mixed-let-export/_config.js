import { test } from '../../test';

export default test({
	get props() {
		return { a: 42 };
	},

	html: `
		42
	`
});

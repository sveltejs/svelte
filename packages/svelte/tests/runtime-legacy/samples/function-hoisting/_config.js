import { test } from '../../test';

export default test({
	get props() {
		return { greeting: 'Good day' };
	},

	html: '<h1>Good day, world</h1>'
});

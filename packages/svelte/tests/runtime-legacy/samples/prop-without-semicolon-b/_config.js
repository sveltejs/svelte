import { test } from '../../test';

export default test({
	get props() {
		return { name: 'world' };
	},

	html: '<h1>Hello world!</h1>'
});

import { test } from '../../test';

export default test({
	get props() {
		return { currentUser: { name: 'world' } };
	},

	html: `
		<h1>Hello world!</h1>
	`
});

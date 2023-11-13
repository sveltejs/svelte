import { test } from '../../test';

export default test({
	get props() {
		return { name: 'everybody' };
	},

	html: '<h1>Hello everybody!</h1>'
});

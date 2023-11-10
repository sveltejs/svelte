import { test } from '../../test';

export default test({
	html: '<h1>Hello world!</h1>',

	before_test() {
		process.env.TMP_VAR = 'world';
	},

	after_test() {
		delete process.env.TMP_VAR;
	}
});

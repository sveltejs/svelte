import { test } from '../../test';

/** @type {typeof console.log} */
let log;

export default test({
	before_test() {
		log = console.log;
		console.log = () => {};
	},

	after_test() {
		console.log = log;
	}
});

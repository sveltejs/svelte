import { test } from '../../test';

/** @type {string[]} */
let logs = [];
/** @type {typeof console['error']} */
let console_error;

export default test({
	before_test() {
		console_error = console.error;
		console.error = (...args) => logs.push(args.join(''));
	},
	after_test() {
		console.error = console_error;
	},
	test({ deepEqual }) {
		deepEqual(logs, [
			"Failed to hydrate: HierarchyRequestError: Node can't be inserted in a #text parent."
		]);
	}
});

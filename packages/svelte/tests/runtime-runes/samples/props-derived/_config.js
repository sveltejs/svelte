import { test } from '../../test';

let math_random = Math.random;
let calls = 0;

export default test({
	skip_if_hydrate: 'permanent',
	before_test() {
		Math.random = function () {
			calls++;
			return math_random.call(this);
		};
	},
	after_test() {
		Math.random = math_random;
		calls = 0;
	},
	test({ assert }) {
		assert.equal(calls, 1);
	}
});

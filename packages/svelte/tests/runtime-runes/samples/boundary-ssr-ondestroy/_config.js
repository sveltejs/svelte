import { test } from '../../test';

/** @type {string[]} */
const log = [];

export default test({
	mode: ['server', 'async-server'],
	props: { log },
	before_test() {
		log.length = 0;
	},
	transformError: (error) => ({ message: String(error) }),
	ssrHtml: '<p>failed</p><p>outside</p>',
	test_ssr({ assert }) {
		assert.deepEqual(log, [
			'setup sibling',
			'setup thrower',
			'setup outside',
			'destroy sibling',
			'destroy thrower',
			'destroy outside'
		]);
	}
});

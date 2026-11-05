import { test } from '../../test';

/** @type {string[]} */
const log = [];

export default test({
	mode: ['server'],
	props: { log },
	before_test() {
		log.length = 0;
	},
	transformError: () => 'error',
	ssrHtml: '<p>first fallback</p><p>outside</p><p>second fallback</p>',
	test_ssr({ assert }) {
		assert.deepEqual(log, [
			'setup first',
			'setup first fallback',
			'setup outside',
			'setup second',
			'setup second fallback',
			'destroy first',
			'destroy first fallback',
			'destroy outside',
			'destroy second',
			'destroy second fallback',
			'destroy root'
		]);
	}
});

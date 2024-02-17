import { test } from '../../test';

/**
 * @type {any[]}
 */
let log;
/**
 * @type {typeof console.log}}
 */
let original_log;

export default test({
	skip_if_ssr: 'permanent',
	skip_if_hydrate: 'permanent', // log patching will be too late
	before_test() {
		log = [];
		original_log = console.log;
		console.log = (...v) => {
			log.push(...v);
		};
	},
	after_test() {
		console.log = original_log;
	},
	async test({ assert }) {
		assert.deepEqual(log, ['init']);
	}
});

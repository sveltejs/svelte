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
	compileOptions: {
		dev: true
	},
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
	async test({ assert, target }) {
		const [btn] = target.querySelectorAll('button');
		btn.click();
		await Promise.resolve();

		assert.deepEqual(log, ['init', {}, 'init', [], 'update', { x: 'hello' }, 'update', ['hello']]);
	}
});

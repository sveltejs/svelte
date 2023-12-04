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
		assert.deepEqual(log, []);

		const [b1, b2] = target.querySelectorAll('button');
		b1.click();
		b2.click();
		await Promise.resolve();

		assert.ok(
			log[0].stack.startsWith('Error:') && log[0].stack.includes('HTMLButtonElement.on_click')
		);
		assert.deepEqual(log[1], 1);
	}
});

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
	async test({ assert, target, component }) {
		const [b1, b2] = target.querySelectorAll('button');
		b1.click();
		b2.click();
		await Promise.resolve();

		assert.deepEqual(log[0], 0);
		assert.deepEqual(log[1].startsWith('$log.trace: HTMLButtonElement.on_click'), true);
		assert.deepEqual(log[2], 1);
	}
});

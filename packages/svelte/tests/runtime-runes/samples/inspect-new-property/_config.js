import { test } from '../../test';

/** @type {any[]} */
let log;

let original_log = console.log;

export default test({
	compileOptions: {
		dev: true
	},

	before_test() {
		log = [];
		console.log = (...v) => {
			log.push(...v);
		};
	},

	after_test() {
		console.log = original_log;
	},

	async test({ assert, target }) {
		assert.deepEqual(log, ['init', {}, 'init', []]);
		log.length = 0;

		const [btn] = target.querySelectorAll('button');
		btn.click();
		await Promise.resolve();

		assert.deepEqual(log, ['update', { x: 'hello' }, 'update', ['hello']]);
	}
});

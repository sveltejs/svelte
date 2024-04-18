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
		assert.deepEqual(log, ['init', { x: { count: 0 } }, [{ count: 0 }]]);
		log.length = 0;

		const [b1] = target.querySelectorAll('button');
		b1.click();
		await Promise.resolve();

		assert.deepEqual(log, ['update', { x: { count: 1 } }, [{ count: 1 }]]);
	}
});

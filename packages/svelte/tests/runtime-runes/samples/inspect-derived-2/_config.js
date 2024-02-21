import { flushSync } from 'svelte';
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
		const button = target.querySelector('button');

		flushSync(() => {
			button?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>update</button>\n1`);
		assert.deepEqual(log, [
			'init',
			{
				data: {
					derived: 0,
					list: []
				},
				derived: []
			},
			'update',
			{
				data: {
					derived: 0,
					list: [1]
				},
				derived: [1]
			}
		]);
	}
});

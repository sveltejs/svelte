import { test } from '../../test';

/**
 * @type {any[]}
 */
let log;
/**
 * @type {typeof console.warn}}
 */
let original_log;

export default test({
	compileOptions: {
		dev: true
	},
	before_test() {
		log = [];
		original_log = console.warn;
		console.warn = (...v) => {
			log.push(...v);
		};
	},
	after_test() {
		console.warn = original_log;
	},
	html: `<button>state1.value: a state2.value: a</button>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<button>state1.value: b state2.value: b</button>`);
		assert.deepEqual(log, [
			'Object passed to $state was frozen after being passed to $state before. Consider using $state.frozen instead, or unfreeze the object.'
		]);
	}
});

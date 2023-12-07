import { test } from '../../test';

/**
 * @type {any[]}
 */
let log;

export default test({
	compileOptions: {
		dev: true
	},

	get props() {
		log = [];
		return {
			push: (/** @type {any} */ ...v) => log.push(...v)
		};
	},

	async test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		await Promise.resolve();

		button?.click();
		await Promise.resolve();

		assert.deepEqual(log, ['init', 'X', 'update', 'XX', 'update', 'XXX']);
	}
});

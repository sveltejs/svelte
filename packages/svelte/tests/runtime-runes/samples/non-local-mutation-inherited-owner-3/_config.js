import { test } from '../../test';

/** @type {typeof console.warn} */
let warn;

/** @type {any[]} */
let warnings = [];

export default test({
	html: `<button>[]</button>`,

	compileOptions: {
		dev: true
	},

	before_test: () => {
		warn = console.warn;

		console.warn = (...args) => {
			warnings.push(...args);
		};
	},

	after_test: () => {
		console.warn = warn;
		warnings = [];
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.htmlEqual(target.innerHTML, `<button>[foo]</button>`);

		assert.deepEqual(warnings, [], 'expected getContext to have widened ownership');
	}
});

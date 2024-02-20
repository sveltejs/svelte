import { test } from '../../test';

/** @type {typeof console.warn} */
let warn;

/** @type {any[]} */
let warnings = [];

export default test({
	html: `<button>clicks: 0</button>`,

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

		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button>`);

		assert.deepEqual(warnings, []);
	}
});

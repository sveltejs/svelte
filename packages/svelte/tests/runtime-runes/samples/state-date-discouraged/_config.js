import { test } from '../../test';

/** @type {typeof console.warn} */
let warn;

/** @type {typeof console.trace} */
let trace;

/** @type {any[]} */
let warnings = [];

export default test({
	compileOptions: {
		dev: true
	},

	before_test: () => {
		warn = console.warn;
		trace = console.trace;

		console.warn = (...args) => {
			warnings.push(...args);
		};

		console.trace = () => {};
	},

	after_test: () => {
		console.warn = warn;
		console.trace = trace;

		warnings = [];
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.deepEqual(warnings, [
			`Date objects used within the $state() rune will not be reactive. Consider using Svelte's reactive version of the Date object from 'svelte/reactivity':` +
				`\n\nimport { Date } from 'svelte/reactivity';\n\nconst date = new Date();`
		]);
	}
});

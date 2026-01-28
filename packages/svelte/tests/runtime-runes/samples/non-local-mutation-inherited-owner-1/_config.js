import { flushSync } from 'svelte';
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

	test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(target.innerHTML, `<button>[foo]</button>`);

		assert.deepEqual(warnings, [], 'expected getContext to have widened ownership');
	}
});

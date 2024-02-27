import { test } from '../../test';

let console_error = console.error;

/**
 * @type {any[]}
 */
const log = [];

export default test({
	compileOptions: {
		dev: true
	},

	html: `<p></p><h1>foo</h1><p></p>`,

	recover: true,

	before_test() {
		console.error = (x) => {
			log.push(x);
		};
	},

	after_test() {
		console.error = console_error;
		log.length = 0;
	},

	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `<p></p><h1>foo</h1><p></p>`);
		if (log.length > 0) {
			assert.deepEqual(log, ['Svelte SSR validation error:\n\n']);
		}
	}
});

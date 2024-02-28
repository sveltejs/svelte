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

	async test({ assert, target, variant }) {
		await assert.htmlEqual(target.innerHTML, `<p></p><h1>foo</h1><p></p>`);
		if (variant === 'hydrate') {
			assert.equal(
				log[0],
				`Svelte SSR validation error:\n\n<h1> is invalid inside <p>\n\n` +
					'Ensure your components render valid HTML as the browser will try to repair invalid HTML, ' +
					'which may result in content being shifted around and will likely result in a hydration mismatch.'
			);
		}
	}
});

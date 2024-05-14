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
				'`<h1>` (.../samples/invalid-html-ssr/Component.svelte:1:0) cannot contain `<p>` (.../samples/invalid-html-ssr/main.svelte:5:0)\n\n' +
					'This can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.'
			);
		}
	}
});

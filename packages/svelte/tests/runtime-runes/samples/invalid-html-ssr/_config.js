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

	html: `<p></p><h1>foo</h1><p></p><form></form>`,

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

	async test({ assert, variant }) {
		if (variant === 'hydrate') {
			assert.equal(
				log[0].split('\n')[0],
				'node_invalid_placement_ssr: `<p>` (main.svelte:6:0) cannot contain `<h1>` (h1.svelte:1:0)'
			);
			assert.equal(
				log[1].split('\n')[0],
				'node_invalid_placement_ssr: `<form>` (main.svelte:9:0) cannot contain `<form>` (form.svelte:1:0)'
			);
		}
	}
});

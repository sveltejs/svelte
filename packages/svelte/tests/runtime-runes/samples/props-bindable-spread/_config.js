import { test } from '../../test';

let failed_too_soon = true;

export default test({
	html: `
	<p>0 0 0</p>
	<button>0</button>
	<button>0</button>
	<button>0</button>
	`,

	before_test() {
		failed_too_soon = true;
	},
	async test({ assert, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		b1.click();
		b2.click();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
		<p>1 1 0</p>
		<button>1</button>
		<button>1</button>
		<button>0</button>
		`
		);

		failed_too_soon = false;

		b3.click();
		await Promise.resolve();
	},
	test_ssr() {
		failed_too_soon = false;
	},
	after_test() {
		if (failed_too_soon) {
			throw new Error('Test failed too soon');
		}
	},

	runtime_error:
		"Cannot write to property 'count' of rest element of $props.bindable(). It is readonly because it was not declared using bind: on the consumer component."
});

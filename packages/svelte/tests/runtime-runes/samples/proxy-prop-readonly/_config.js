import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.htmlEqual(target.innerHTML, `<button>clicks: 0</button>`);
	},

	runtime_error:
		'Non-bound props cannot be mutated — use `bind:<prop>={...}` to make `count` settable. Fallback values can never be mutated.'
});

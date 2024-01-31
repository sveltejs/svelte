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
		'Non-bound props cannot be mutated — to make the `count` settable, ensure the object it is used within is bound as a prop `bind:<prop>={...}`. Fallback values can never be mutated.'
});

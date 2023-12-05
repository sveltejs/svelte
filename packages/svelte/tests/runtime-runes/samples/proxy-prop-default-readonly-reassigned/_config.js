import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<button>clicks: 1</button>`);

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<button>clicks: 2</button>`);
	}
});

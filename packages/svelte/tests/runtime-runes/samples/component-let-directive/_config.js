import { test } from '../../test';

export default test({
	html: `
		<button>0</button>
		<p slot="named">named slot count is not state</p>
	`,

	test: async ({ assert, target }) => {
		const button = target.querySelector('button');
		await button?.click();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>1</button>
			<p slot="named">named slot count is not state</p>
		`
		);
	}
});

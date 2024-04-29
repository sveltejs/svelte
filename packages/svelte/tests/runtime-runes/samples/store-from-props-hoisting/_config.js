import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, target }) {
		const button = target.querySelector('button');
		await button?.click();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>1</button>
		`
		);
	}
});

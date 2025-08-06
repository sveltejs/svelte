import { test } from '../../test';

export default test({
	html: `<h1>Loading...</h1>`,

	async test({ assert, target }) {
		await new Promise((resolve) => setTimeout(resolve, 100));
		assert.htmlEqual(
			target.innerHTML,
			`
				<h1>Hello, world!</h1>
				<input type="text"/>
			`
		);
	}
});

import { test } from '../../test';

export default test({
	html: `<button type="button">Update Text</button><div></div>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(
			target.innerHTML,
			`<button type="button">Update Text</button><div>updated</div>`
		);
	}
});

import { test } from '../../test';

export default test({
	html: `
		<div>Hello World</div>
		<div>Hello World</div>
	`,

	async test({ assert, component, target }) {
		await component.update_value('Hi Svelte');
		await Promise.resolve();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>Hi Svelte</div>
			<div>Hi Svelte</div>
		`
		);
	}
});

import { test } from '../../test';

export default test({
	html: `
		<p>...waiting</p>
	`,

	async test({ assert, component, target }) {
		await component.promise;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>Context value: 123</p>
		`
		);
	}
});

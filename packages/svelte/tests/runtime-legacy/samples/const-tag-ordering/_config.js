import { test } from '../../test';

export default test({
	html: `
		<div>4 ^ 4 = 256</div>
	`,
	async test({ component, target, assert }) {
		component.value = 3;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>3 ^ 4 = 81</div>
		`
		);
	}
});

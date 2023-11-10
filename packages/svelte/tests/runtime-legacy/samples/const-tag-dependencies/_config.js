import { test } from '../../test';

export default test({
	html: `
		<div>7</div>
	`,
	async test({ component, target, assert }) {
		component.a = 5;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>9</div>
		`
		);
	}
});

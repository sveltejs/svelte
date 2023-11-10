import { test } from '../../test';

export default test({
	html: `
		<span>1</span>
		<span>1</span>
	`,

	async test({ assert, target, component }) {
		component.x = 2;

		assert.htmlEqual(
			target.innerHTML,
			`
			<span>2</span>
			<span>2</span>
		`
		);
	}
});

import { test } from '../../test';

export default test({
	html: `
		<p>10 - 90</p>
	`,

	test({ assert, component, target }) {
		component.width = 50;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>10 - 40</p>
		`
		);
	}
});

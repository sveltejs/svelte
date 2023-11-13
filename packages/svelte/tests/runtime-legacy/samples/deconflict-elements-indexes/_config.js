import { test } from '../../test';

export default test({
	html: `
		<div>
			<i>one</i>
		</div>
	`,

	test({ assert, component, target }) {
		const { tagList } = component;
		tagList.push('two');
		component.tagList = tagList;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<i>one</i>
				<i>two</i>
			</div>
		`
		);
	}
});

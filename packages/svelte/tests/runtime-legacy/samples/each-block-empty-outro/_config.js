import { test } from '../../test';

export default test({
	get props() {
		return { visible: true, empty: [] };
	},

	html: `
		<div>
			<p>text</p>
		</div>
	`,

	test({ assert, component, target }) {
		component.visible = false;

		assert.htmlEqual(target.innerHTML, '');
	}
});

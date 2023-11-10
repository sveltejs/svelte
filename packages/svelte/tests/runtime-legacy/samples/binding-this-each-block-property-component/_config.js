import { test } from '../../test';

export default test({
	html: '',

	async test({ assert, component, target }) {
		component.visible = true;
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a</p>
		`
		);

		assert.ok(component.items[0].ref.isFoo());
	}
});

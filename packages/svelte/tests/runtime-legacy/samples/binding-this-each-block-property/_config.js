import { test } from '../../test';

export default test({
	html: '',

	async test({ assert, component, target }) {
		component.visible = true;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>a</div>
		`
		);

		assert.equal(component.items[0].ref, target.querySelector('div'));
	}
});

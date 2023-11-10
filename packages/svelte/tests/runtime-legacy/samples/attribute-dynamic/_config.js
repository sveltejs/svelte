import { ok, test } from '../../test';

export default test({
	html: '<div style="color: red;">red</div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		ok(div);

		assert.equal(div.style.color, 'red');

		component.color = 'blue';
		assert.htmlEqual(target.innerHTML, '<div style="color: blue;">blue</div>');
		assert.equal(div.style.color, 'blue');
	}
});

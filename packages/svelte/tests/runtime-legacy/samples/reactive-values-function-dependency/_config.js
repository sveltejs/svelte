import { test } from '../../test';

export default test({
	html: '<p>2</p>',

	test({ assert, component, target }) {
		component.y = 2;
		assert.equal(component.x, 4);
		assert.htmlEqual(target.innerHTML, '<p>4</p>');
	}
});

import { test } from '../../test';

export default test({
	html: 'one',

	test({ assert, component, target }) {
		component.text = 'two';
		assert.htmlEqual(target.innerHTML, 'two');
	}
});

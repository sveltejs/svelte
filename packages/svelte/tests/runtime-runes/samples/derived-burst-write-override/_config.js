import { test } from '../../test';

export default test({
	html: '<p>1</p>',
	test({ assert, instance, target }) {
		instance.run();
		assert.htmlEqual(target.innerHTML, '<p>5</p>');
	}
});

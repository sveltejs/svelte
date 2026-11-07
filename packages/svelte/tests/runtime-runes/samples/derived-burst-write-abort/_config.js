import { test } from '../../test';

export default test({
	html: '<p>-1</p>',
	test({ assert, instance, target, errors }) {
		assert.deepEqual(instance.run(), { first: 1, second: 2, value: 2 });
		assert.htmlEqual(target.innerHTML, '<p>2</p>');
		assert.deepEqual(errors, []);
	}
});

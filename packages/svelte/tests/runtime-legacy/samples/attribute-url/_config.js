import { ok, test } from '../../test';

export default test({
	test({ assert, target }) {
		const div = target.querySelector('div');
		ok(div);

		assert.equal(div.style.backgroundImage, 'url(https://example.com/foo.jpg)');
		assert.equal(div.style.color, 'red');
	}
});

import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const input = target.querySelector('input');

		input?.dispatchEvent(new Event('input', { bubbles: true }));

		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, 'true <input class="hello">');
	}
});

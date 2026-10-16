import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, '<ul></ul>');
		await new Promise((r) => setTimeout(r, 110));
		assert.htmlEqual(target.innerHTML, '<ul><span>#1 0</span></ul>');
		await new Promise((r) => setTimeout(r, 110));
		assert.htmlEqual(target.innerHTML, '<ul><span>#2 0</span><span>#1 1</span></ul>');
		await new Promise((r) => setTimeout(r, 110));
		assert.htmlEqual(target.innerHTML, '<ul><span>#3 0</span><span>#2 1</span></ul>');
	}
});

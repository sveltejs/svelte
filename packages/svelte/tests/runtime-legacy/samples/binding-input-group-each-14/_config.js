import { test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const [input1, input2, input3, input4] = target.querySelectorAll('input');
		const [p] = target.querySelectorAll('p');
		const event = new window.Event('change');

		input1.checked = true;
		await input1.dispatchEvent(event);
		await Promise.resolve();
		assert.htmlEqual(p.innerHTML, '["1a"]');

		input2.checked = true;
		await input1.dispatchEvent(event);
		await Promise.resolve();
		assert.htmlEqual(p.innerHTML, '["1a","1b"]');

		input3.checked = true;
		await input1.dispatchEvent(event);
		await Promise.resolve();
		assert.htmlEqual(p.innerHTML, '["1a","1b","2a"]');

		input4.checked = true;
		await input1.dispatchEvent(event);
		await Promise.resolve();
		assert.htmlEqual(p.innerHTML, '["1a","1b","2a","2b"]');

		input1.checked = false;
		await input1.dispatchEvent(event);
		await Promise.resolve();
		assert.htmlEqual(p.innerHTML, '["1b","2a","2b"]');

		input3.checked = false;
		await input1.dispatchEvent(event);
		await Promise.resolve();
		assert.htmlEqual(p.innerHTML, '["1b","2b"]');
	}
});

import { test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const els = target.querySelectorAll('input');
		assert.equal(els.length, 3);
		const [input1, input2, input3] = els;
		const event = new window.Event('change');

		for (const input of els) {
  		input.checked = false;
		  await input.dispatchEvent(event);
		}

		assert.equal(input1.checked, false);
		assert.equal(input2.checked, false);
		assert.equal(input3.checked, false);

		input3.checked = true;
		await input3.dispatchEvent(event);
		await Promise.resolve();
		
		assert.equal(input1.checked, false);
		assert.equal(input2.checked, false);
		assert.equal(input3.checked, true);
		
		input1.checked = true;
		await input1.dispatchEvent(event);
		await Promise.resolve();
		
		assert.equal(input1.checked, true);
		assert.equal(input2.checked, false);
		assert.equal(input3.checked, true);
	}
});

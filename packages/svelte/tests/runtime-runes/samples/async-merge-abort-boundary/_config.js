import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, instance, target, logs }) {
		instance.show();
		await tick();
		assert.htmlEqual(target.innerHTML, '<i>pending</i>');
		instance.update();
		await tick();
		instance.resolve('value', 2);
		await tick();
		assert.deepEqual(logs.splice(0), ['continued value with 2 2']);
		instance.resolve('gate', 2);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>value: 2 2</p><span>2</span>');
	}
});

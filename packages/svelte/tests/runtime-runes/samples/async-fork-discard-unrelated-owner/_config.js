import { tick } from 'svelte';
import { test } from '../../test';

// The real attempt continues independently of the creator fork. An unrelated
// fork can adopt the same pending branch and initialize too, but its marker=99
// must never become the real attempt's ordinary snapshot.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [
			creator,
			real,
			first,
			unrelated,
			discard_creator,
			second,
			discard_unrelated,
			late_creator,
			late_unrelated
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		creator.click();
		await tick();
		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>pending</p>');
		assert.deepEqual(logs.splice(0), ['load 1', 'load 0']);

		first.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>pending</p>');
		assert.deepEqual(logs.splice(0), ['load 10']);

		unrelated.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>pending</p>');
		assert.deepEqual(logs.splice(0), ['load 0']);

		discard_creator.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>pending</p>');
		assert.deepEqual(logs.splice(0), []);

		second.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>0 10 0</p>');
		assert.deepEqual(logs.splice(0), ['continued 0 10 0']);

		discard_unrelated.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>0 10 0</p>');
		assert.deepEqual(logs, []);

		for (const button of [late_creator, late_unrelated]) {
			button.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>0 10 0</p>');
			assert.deepEqual(logs, [], 'discarded attempts must not start another stage');
		}
	}
});

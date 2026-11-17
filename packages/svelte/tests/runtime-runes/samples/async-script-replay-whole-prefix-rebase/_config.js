import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [show, update, resolve_new, resolve_old] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		show.click();
		await tick();
		update.click();
		await tick();
		resolve_new.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2|2|2|2</p>');
		assert.deepEqual(logs.splice(0), ['init 1', 'load 1', 'init 2', 'load 2']);
		resolve_old.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2|2|2|2</p>');
		assert.deepEqual(logs, []);
	}
});

import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true, scriptReplay: true } },
	async test({ assert, target, logs }) {
		// The harness flushed the mounting batch. Let its initial promise continuation
		// restore that batch before settled() selects the work it should wait for.
		await tick();
		await settled();
		const [update, edit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		const [paragraph] = output.querySelectorAll('p');
		assert.htmlEqual(output.innerHTML, '<p data-instance="stable">2 4 2 7 0</p>');
		assert.deepEqual(
			logs.filter(([kind]) => kind === 'snapshot'),
			[['snapshot', 2]]
		);
		assert.deepEqual(
			logs.filter(([kind]) => kind === 'installed'),
			[['installed']]
		);

		edit.click();
		await settled();
		update.click();
		await settled();

		assert.htmlEqual(output.innerHTML, '<p data-instance="stable">3 6 2 9 1</p>');
		assert.equal(output.querySelector('p'), paragraph);
		assert.deepEqual(
			logs.filter(([kind]) => kind === 'snapshot'),
			[['snapshot', 2]]
		);
		assert.deepEqual(
			logs.filter(([kind]) => kind === 'installed'),
			[['installed']]
		);
		assert.ok(logs.some(([kind, site, value]) => kind === 'load' && site === 'a' && value === 2));
		assert.ok(logs.some(([kind, site, value]) => kind === 'load' && site === 'b' && value === 8));
	}
});

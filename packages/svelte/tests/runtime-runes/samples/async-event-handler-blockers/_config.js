import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	async test({ assert, target, window, logs }) {
		await new Promise((r) => setTimeout(r));
		await tick();

		const button = target.querySelector('button');
		const div = target.querySelector('div');

		button?.click();
		div?.dispatchEvent(new window.MouseEvent('mouseenter'));
		window.dispatchEvent(new window.Event('resize'));

		assert.deepEqual(logs, ['click', 'mouseenter', 'resize']);
	}
});

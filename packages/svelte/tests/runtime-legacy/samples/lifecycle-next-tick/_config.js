import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		buttons[0].dispatchEvent(click);
		await tick();
		assert.deepEqual(component.snapshots, ['before 0', 'after 1']);

		buttons[0].dispatchEvent(click);
		await tick();
		assert.deepEqual(component.snapshots, ['before 0', 'after 1', 'before 1', 'after 2']);

		buttons[1].dispatchEvent(click);
		await tick();
		assert.deepEqual(component.snapshots, [
			'before 0',
			'after 1',
			'before 1',
			'after 2',
			'before 2',
			'after 2'
		]);
	}
});

import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		assert.equal(target.querySelectorAll('input').length, 3);

		const input = target.querySelector('input');
		ok(input);
		input.value = 'svelte';
		await input.dispatchEvent(new window.Event('input'));

		assert.equal(target.querySelectorAll('input').length, 3);
		assert.deepEqual(component.data, { a: 'svelte', b: 'B', c: 'C' });
		assert.deepEqual(component.x, ['a', 'b', 'c']);
	}
});

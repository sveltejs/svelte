export default {
	async test({ assert, component, target }) {
		assert.equal(target.querySelectorAll('input').length, 3);

		const input = target.querySelector('input');
		input.value = 'svelte';
		await input.dispatchEvent(new window.Event('input'));

		assert.equal(target.querySelectorAll('input').length, 3);
		assert.deepEqual(component.data, { a: 'svelte', b: 'B', c: 'C' });
		assert.deepEqual(component.x, ['a', 'b', 'c']);
	},
};

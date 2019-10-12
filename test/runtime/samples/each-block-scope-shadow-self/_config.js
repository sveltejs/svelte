export default {
	html: '<input type="text"><input type="text"><input type="text">',
	async test({ assert, component, target }) {
		const input = target.querySelector('input');
		input.value = 'svelte';
		await input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(
			target.innerHTML,
			`
		<input type="text"><input type="text"><input type="text">
		`
		);
		assert.deepEqual(component.data, { a: 'svelte', b: 'B', c: 'C' });
		assert.deepEqual(component.x, ['a', 'b', 'c']);
	},
};

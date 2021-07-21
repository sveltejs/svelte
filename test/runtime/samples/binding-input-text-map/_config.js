export default {
	html: `
		<input>
	`,

	ssrHtml: `
		<input value="50">
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.value, '50');

		component.map.get(component.id).x = 30;
		component.map = component.map;
		assert.equal(input.value, '30');

		input.value = '42';
		await input.dispatchEvent(new window.Event('input'));

		assert.equal(input.value, '42');
		assert.equal(component.map.get(component.id).x, '42')
	}
};

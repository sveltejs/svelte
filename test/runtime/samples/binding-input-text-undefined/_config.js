export default {
	html: `
		<input>
	`,

	ssrHtml: `
		<input>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.value, '');

		component.x = null;
		assert.equal(input.value, '');

		component.x = undefined;
		assert.equal(input.value, '');

		component.x = 'string';
		component.x = undefined;
		assert.equal(input.value, '');

		component.x = 0;
		assert.equal(input.value, '0');

		component.x = undefined;
		assert.equal(input.value, '');
	},
};

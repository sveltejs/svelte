import { ok, test } from '../../test';

export default test({
	html: `
		<input>
	`,

	ssrHtml: `
		<input>
	`,

	async test({ assert, component, target }) {
		const input = target.querySelector('input');
		ok(input);
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
	}
});

import { ok, test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		const event = new window.Event('input');
		input.value = 'changed';
		await input.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>changed</p>
		`
		);
	}
});

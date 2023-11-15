import { assert_ok, test } from '../../test';

export default test({
	props: {
		name: 'world'
	},

	snapshot(target) {
		return {
			input: target.querySelector('input'),
			p: target.querySelector('p')
		};
	},

	async test(assert, target, _, component, window) {
		const input = target.querySelector('input');
		assert_ok(input);
		input.value = 'everybody';
		await input.dispatchEvent(new window.Event('input'));

		assert.equal(component.name, 'everybody');
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>Hello everybody!</p>
		`
		);
	}
});

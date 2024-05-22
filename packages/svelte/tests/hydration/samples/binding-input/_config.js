import { flushSync } from 'svelte';
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

	test(assert, target, _, component, window) {
		const input = target.querySelector('input');
		assert_ok(input);
		input.value = 'everybody';
		input.dispatchEvent(new window.Event('input'));
		flushSync();

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

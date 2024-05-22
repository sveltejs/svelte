import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	get props() {
		return { user: { name: 'alice' } };
	},

	html: `
		<input>
		<p>hello alice</p>
	`,

	ssrHtml: `
		<input value=alice>
		<p>hello alice</p>
	`,

	test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		assert.equal(input.value, 'alice');

		const event = new window.Event('input');

		input.value = 'bob';
		input.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>hello bob</p>
		`
		);

		const user = component.user;
		user.name = 'carol';

		component.user = user;
		assert.equal(input.value, 'carol');
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>hello carol</p>
		`
		);
	}
});

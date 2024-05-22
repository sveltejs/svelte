import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	get props() {
		return { component: { name: 'world' } };
	},

	html: `
		<h1>Hello world!</h1>
		<input>
	`,

	ssrHtml: `
		<h1>Hello world!</h1>
		<input value=world>
	`,

	test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		ok(input);
		assert.equal(input.value, 'world');

		const event = new window.Event('input');

		input.value = 'everybody';
		input.dispatchEvent(event);
		flushSync();

		assert.equal(input.value, 'everybody');
		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>Hello everybody!</h1>
			<input>
		`
		);

		component.component = { name: 'goodbye' };
		assert.equal(input.value, 'goodbye');
		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>Hello goodbye!</h1>
			<input>
		`
		);
	}
});

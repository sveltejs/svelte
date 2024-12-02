import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return { foo: 'a', items: ['x'] };
	},

	html: `
		<div><input><p>a</p></div>
		<div><input><p>x</p></div>
	`,

	ssrHtml: `
		<div><input value=a><p>a</p></div>
		<div><input value=x><p>x</p></div>
	`,

	test({ assert, component, target, window }) {
		const inputs = [...target.querySelectorAll('input')];
		const event = new window.Event('input');

		assert.equal(inputs[0].value, 'a');

		inputs[0].value = 'b';
		inputs[1].value = 'y';
		inputs[0].dispatchEvent(event);
		flushSync();
		inputs[1].dispatchEvent(event);
		flushSync();

		assert.equal(component.foo, 'b');
		assert.equal(component.items[0], 'y');

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input><p>b</p></div>
			<div><input><p>y</p></div>
		`
		);
	}
});

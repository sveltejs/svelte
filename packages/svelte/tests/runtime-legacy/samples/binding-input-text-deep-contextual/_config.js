import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return {
			items: [{ description: 'one' }, { description: 'two' }, { description: 'three' }]
		};
	},

	html: `
		<div><input><p>one</p></div>
		<div><input><p>two</p></div>
		<div><input><p>three</p></div>
	`,

	ssrHtml: `
		<div><input value=one><p>one</p></div>
		<div><input value=two><p>two</p></div>
		<div><input value=three><p>three</p></div>
	`,

	test({ assert, component, target, window }) {
		const inputs = [...target.querySelectorAll('input')];

		assert.equal(inputs[0].value, 'one');

		const event = new window.Event('input', { bubbles: true });

		inputs[1].value = 'four';
		inputs[1].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input><p>one</p></div>
			<div><input><p>four</p></div>
			<div><input><p>three</p></div>
		`
		);

		const items = component.items;
		items[2].description = 'five';

		component.items = items;
		assert.equal(inputs[2].value, 'five');
		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input><p>one</p></div>
			<div><input><p>four</p></div>
			<div><input><p>five</p></div>
		`
		);
	}
});

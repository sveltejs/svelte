import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return {
			items: [
				{ description: 'one', completed: true },
				{ description: 'two', completed: false },
				{ description: 'three', completed: false }
			]
		};
	},

	html: `
		<div>
			<input type="checkbox"><p>one</p>
		</div>
		<div>
			<input type="checkbox"><p>two</p>
		</div>
		<div>
			<input type="checkbox"><p>three</p>
		</div>
		<p>1 completed</p>
	`,

	ssrHtml: `
		<div>
			<input type="checkbox" checked><p>one</p>
		</div>
		<div>
			<input type="checkbox"><p>two</p>
		</div>
		<div>
			<input type="checkbox"><p>three</p>
		</div>
		<p>1 completed</p>
	`,

	test({ assert, component, target, window }) {
		const inputs = [...target.querySelectorAll('input')];

		assert.ok(inputs[0].checked);
		assert.ok(!inputs[1].checked);
		assert.ok(!inputs[2].checked);

		const event = new window.Event('change');

		inputs[1].checked = true;
		inputs[1].dispatchEvent(event);
		flushSync();

		assert.equal(component.numCompleted, 2);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input type="checkbox"><p>one</p></div><div><input type="checkbox"><p>two</p></div><div><input type="checkbox"><p>three</p></div>
			<p>2 completed</p>
		`
		);

		const items = component.items;
		items[2].completed = true;

		component.items = items;
		assert.ok(inputs[2].checked);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input type="checkbox"><p>one</p></div><div><input type="checkbox"><p>two</p></div><div><input type="checkbox"><p>three</p></div>
			<p>3 completed</p>
		`
		);
	}
});

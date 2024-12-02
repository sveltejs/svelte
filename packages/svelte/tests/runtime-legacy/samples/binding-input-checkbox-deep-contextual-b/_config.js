import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
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
	`,

	ssrHtml: `
		<div>
			<input type="checkbox"><p>one</p>
		</div>
		<div>
			<input type="checkbox"><p>two</p>
		</div>
		<div>
			<input type="checkbox"><p>three</p>
		</div>
	`,

	test({ assert, component, target, window }) {
		const inputs = [...target.querySelectorAll('input')];

		const event = new window.Event('change');

		inputs[1].checked = true;
		inputs[1].dispatchEvent(event);
		flushSync();

		component.clear();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input type="checkbox"><p>one</p></div>
			<div><input type="checkbox"><p>three</p></div>
		`
		);

		inputs[2].checked = true;
		inputs[2].dispatchEvent(event);
		flushSync();
		component.clear();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input type="checkbox"><p>one</p></div>
		`
		);
	}
});

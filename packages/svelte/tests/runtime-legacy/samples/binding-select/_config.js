import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	ssrHtml: `
		<p>selected: one</p>

		<select>
			<option selected>one</option>
			<option>two</option>
			<option>three</option>
		</select>

		<p>selected: one</p>
	`,

	get props() {
		return { selected: 'one' };
	},

	test({ assert, component, target, window, variant }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>selected: one</p>

			<select>
				<option${variant === 'hydrate' ? ' selected' : ''}>one</option>
				<option>two</option>
				<option>three</option>
			</select>

			<p>selected: one</p>
		`
		);
		const select = target.querySelector('select');
		ok(select);

		const options = [...target.querySelectorAll('option')];

		assert.deepEqual(options, [...select.options]);
		assert.equal(component.selected, 'one');

		const change = new window.Event('change');

		options[1].selected = true;
		select.dispatchEvent(change);
		flushSync();

		assert.equal(component.selected, 'two');
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>selected: two</p>

			<select>
				<option${variant === 'hydrate' ? ' selected' : ''}>one</option>
				<option>two</option>
				<option>three</option>
			</select>

			<p>selected: two</p>
		`
		);

		component.selected = 'three';
	}
});

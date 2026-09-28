import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	get props() {
		return { selected: ['two', 'three'] };
	},

	ssrHtml: `
		<select multiple>
			<option>one</option>
			<option selected>two</option>
			<option selected>three</option>
		</select>

		<p>selected: two, three</p>
	`,

	test({ assert, component, target, window, variant }) {
		const selected = variant === 'hydrate' ? ' selected' : '';
		assert.htmlEqual(
			target.innerHTML,
			`
			<select multiple>
				<option>one</option>
				<option${selected}>two</option>
				<option${selected}>three</option>
			</select>

			<p>selected: two, three</p>
		`
		);
		const select = target.querySelector('select');
		ok(select);
		const options = [...target.querySelectorAll('option')];

		const change = new window.Event('change');

		options[1].selected = false;
		select.dispatchEvent(change);
		flushSync();

		assert.deepEqual(component.selected, ['three']);
		assert.htmlEqual(
			target.innerHTML,
			`
			<select multiple>
				<option>one</option>
				<option${selected}>two</option>
				<option${selected}>three</option>
			</select>

			<p>selected: three</p>
		`
		);

		options[0].selected = true;
		select.dispatchEvent(change);
		flushSync();

		assert.deepEqual(component.selected, ['one', 'three']);
		assert.htmlEqual(
			target.innerHTML,
			`
			<select multiple>
				<option>one</option>
				<option${selected}>two</option>
				<option${selected}>three</option>
			</select>

			<p>selected: one, three</p>
		`
		);

		component.selected = ['one', 'two'];

		assert.ok(options[0].selected);
		assert.ok(options[1].selected);
		assert.ok(!options[2].selected);

		assert.htmlEqual(
			target.innerHTML,
			`
			<select multiple>
				<option>one</option>
				<option${selected}>two</option>
				<option${selected}>three</option>
			</select>

			<p>selected: one, two</p>
		`
		);
	}
});

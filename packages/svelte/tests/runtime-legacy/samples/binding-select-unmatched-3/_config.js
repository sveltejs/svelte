import { ok, test } from '../../test';

// test select binding behavior when a selected option is removed
export default test({
	skip_if_ssr: 'permanent',

	html: `<p>selected: a</p><select><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>`,

	async test({ assert, component, target }) {
		const select = target.querySelector('select');
		ok(select);
		const options = target.querySelectorAll('option');

		// first option should be selected by default since no value was bound
		assert.equal(component.selected, 'a');
		assert.equal(select.value, 'a');
		assert.ok(options[0].selected);

		// remove the selected item, so the bound value no longer matches anything
		component.items = ['b', 'c'];

		// There's a MutationObserver
		await Promise.resolve();

		// now no option should be selected
		assert.equal(select.value, '');
		assert.equal(select.selectedIndex, -1);

		assert.htmlEqual(
			target.innerHTML,
			`<p>selected:</p><select><option value="b">b</option><option value="c">c</option></select>`
		);
	}
});

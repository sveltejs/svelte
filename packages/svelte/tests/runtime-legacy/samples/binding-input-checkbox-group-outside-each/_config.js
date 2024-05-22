import { flushSync } from 'svelte';
import { test } from '../../test';

const values = [{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Gamma' }];

export default test({
	get props() {
		return { values, selected: [values[1]] };
	},

	html: `
		<label>
			<input type="checkbox" value="[object Object]"> Alpha
		</label>

		<label>
			<input type="checkbox" value="[object Object]"> Beta
		</label>

		<label>
			<input type="checkbox" value="[object Object]"> Gamma
		</label>

		<p>Beta</p>`,

	ssrHtml: `
		<label>
			<input type="checkbox" value="[object Object]"> Alpha
		</label>

		<label>
			<input type="checkbox" value="[object Object]" checked> Beta
		</label>

		<label>
			<input type="checkbox" value="[object Object]"> Gamma
		</label>

		<p>Beta</p>`,

	test({ assert, component, target, window }) {
		const inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, true);
		assert.equal(inputs[2].checked, false);

		const event = new window.Event('change');

		inputs[0].checked = true;
		inputs[0].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<label>
				<input type="checkbox" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Beta
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Gamma
			</label>

			<p>Alpha, Beta</p>
		`
		);

		component.selected = [component.values[1], component.values[2]];
		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, true);
		assert.equal(inputs[2].checked, true);

		assert.htmlEqual(
			target.innerHTML,
			`
			<label>
				<input type="checkbox" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Beta
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Gamma
			</label>

			<p>Beta, Gamma</p>
		`
		);
	}
});

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

	async test({ assert, component, target, window }) {
		const inputs = [...target.querySelectorAll('input')];

		const event = new window.Event('change');

		inputs[1].checked = true;
		await inputs[1].dispatchEvent(event);

		await component.clear();

		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input type="checkbox"><p>one</p></div>
			<div><input type="checkbox"><p>three</p></div>
		`
		);

		inputs[2].checked = true;
		await inputs[2].dispatchEvent(event);

		await component.clear();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div><input type="checkbox"><p>one</p></div>
		`
		);
	}
});

import { test } from '../../test';

export default test({
	html: `
		<div>
			<label>1: <input></label>
			<label>2: <input></label>
			<label>3: <input></label>
		</div>
	`,

	ssrHtml: `
		<div>
			<label>1: <input value="a"></label>
			<label>2: <input value="b"></label>
			<label>3: <input value="c"></label>
		</div>
	`,

	async test({ assert, component, target, window }) {
		const inputs = target.querySelectorAll('input');

		inputs[2].value = 'd';
		await inputs[2].dispatchEvent(new window.Event('input'));

		assert.deepEqual(component.letters, ['a', 'b', 'd']);
	}
});

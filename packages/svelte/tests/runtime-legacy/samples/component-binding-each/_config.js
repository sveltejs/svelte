import { test } from '../../test';

export default test({
	html: `
		<input><input><input>
		<p>foo, bar, baz</p>
	`,

	ssrHtml: `
		<input value=foo>
		<input value=bar>
		<input value=baz>
		<p>foo, bar, baz</p>
	`,

	async test({ assert, component, target, window }) {
		const event = new window.MouseEvent('input');
		const inputs = target.querySelectorAll('input');

		inputs[0].value = 'blah';
		await inputs[0].dispatchEvent(event);
		await Promise.resolve();

		assert.deepEqual(component.a, ['blah', 'bar', 'baz']);
		assert.htmlEqual(
			target.innerHTML,
			`
			<input><input><input>
			<p>blah, bar, baz</p>
		`
		);
	}
});

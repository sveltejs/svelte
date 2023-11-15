import { ok, test } from '../../test';

export default test({
	get props() {
		return {
			prop: 'bar',
			objects: [{ foo: 'a', bar: 'b', baz: 'c' }]
		};
	},

	html: `
		<input>
		<pre>{"foo":"a","bar":"b","baz":"c"}</pre>
	`,

	ssrHtml: `
		<input value=b>
		<pre>{"foo":"a","bar":"b","baz":"c"}</pre>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		ok(input);
		const event = new window.Event('input');

		assert.equal(input.value, 'b');

		// edit bar
		input.value = 'e';
		await input.dispatchEvent(event);
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<pre>{"foo":"a","bar":"e","baz":"c"}</pre>
		`
		);

		// edit baz
		component.prop = 'baz';
		assert.equal(input.value, 'c');

		input.value = 'f';
		await input.dispatchEvent(event);
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<pre>{"foo":"a","bar":"e","baz":"f"}</pre>
		`
		);

		// edit foo
		component.prop = 'foo';
		assert.equal(input.value, 'a');

		input.value = 'd';
		await input.dispatchEvent(event);
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<pre>{"foo":"d","bar":"e","baz":"f"}</pre>
		`
		);
	}
});

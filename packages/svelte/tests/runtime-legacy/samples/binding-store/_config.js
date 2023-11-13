import { ok, test } from '../../test';

export default test({
	html: `
		<input>
		<p>hello world</p>
	`,

	ssrHtml: `
		<input value="world">
		<p>hello world</p>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		ok(input);
		assert.equal(input.value, 'world');

		const event = new window.Event('input');

		/** @type {string[]} */
		const names = [];

		// @ts-ignore
		const unsubscribe = component.name.subscribe((name) => {
			names.push(name);
		});

		input.value = 'everybody';
		await input.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>hello everybody</p>
		`
		);

		await component.name.set('goodbye');
		assert.equal(input.value, 'goodbye');
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>hello goodbye</p>
		`
		);

		assert.deepEqual(names, ['world', 'everybody', 'goodbye']);
		unsubscribe();
	}
});

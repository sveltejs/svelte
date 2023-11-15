import { ok, test } from '../../test';

export default test({
	html: `
    Hello
    <input />
	`,
	ssrHtml: `
		Hello
		<input value="Hello"/>
	`,
	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		input.value = 'abcd';
		await input.dispatchEvent(new window.Event('input'));
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
        abcd
        <input />
      `
		);
	}
});

import { ok, test } from '../../test';

export default test({
	html: `
		<button></button>
		<input type=range min=0 max=10>
		<p>10 of 10</p>
	`,

	ssrHtml: `
		<button></button>
		<input type=range min=0 max=10 value=10>
		<p>10 of 10</p>
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);
		assert.equal(input.value, '10');

		// should not change because max is 10, input range behaviour
		// seems there is bug in jsdom (HTMLInputElement-impl) which behaviour is different from real browsers
		// input.value = '20';
		// assert.equal(input.value, '10');

		const button = target.querySelector('button');
		ok(button);
		await button.dispatchEvent(new window.Event('click', { bubbles: true }));
		await Promise.resolve();

		assert.equal(input.value, '20');
		assert.htmlEqual(
			target.innerHTML,
			`
			<button></button>
			<input type=range min=0 max=20>
			<p>20 of 20</p>
		`
		);
	}
});

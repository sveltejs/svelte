import { test } from '../../test';

export default test({
	html: `
		<button>click me</button>
		<button>click me</button>

		<p>{"value":{"i":0,"j":0}}</p>
		<p></p>
	`,

	ssrHtml: `
		<button>click me</button>
		<button>click me</button>

		<p>{}</p>
		<p></p>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelectorAll('button')[1];

		await button.dispatchEvent(new window.Event('click', { bubbles: true }));
		// Multiple ticks necessary because each update is async
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click me</button>
			<button>click me</button>

			<p>{"value":{"i":0,"j":0}}</p>
			<p>{"value":{"i":1,"j":0}}</p>
		`
		);
	}
});

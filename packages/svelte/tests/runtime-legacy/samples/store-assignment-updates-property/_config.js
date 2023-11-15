import { test } from '../../test';

export default test({
	html: `
		<p>a: {"foo":3,"bar":2}</p>
		<p>b: {"foo":3}</p>
		<button></button>
		<button></button>
	`,

	async test({ assert, target, window }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		await btn1.dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: {"foo":4,"bar":2}</p>
			<p>b: {"foo":4,"baz":0}</p>
			<button></button>
			<button></button>
		`
		);

		await btn2.dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a: {"foo":5,"bar":2}</p>
			<p>b: {"foo":5,"qux":0}</p>
			<button></button>
			<button></button>
		`
		);
	}
});

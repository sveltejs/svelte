import { test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		const clickEvent = new window.Event('click', { bubbles: true });

		await btn2.dispatchEvent(clickEvent);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Toggle foo</button>
			<button>Toggle bar</button>
			<hr>
			foo: false, bar: true
			<hr>
			bar!
		`
		);

		await btn1.dispatchEvent(clickEvent);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Toggle foo</button>
			<button>Toggle bar</button>
			<hr>
			foo: true, bar: true
			<hr>
			foo!
		`
		);

		await btn2.dispatchEvent(clickEvent);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Toggle foo</button>
			<button>Toggle bar</button>
			<hr>
			foo: true, bar: false
			<hr>
			foo!
		`
		);

		await btn1.dispatchEvent(clickEvent);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Toggle foo</button>
			<button>Toggle bar</button>
			<hr>
			foo: false, bar: false
			<hr>
		`
		);
	}
});

import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, window }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		const clickEvent = new window.Event('click', { bubbles: true });

		btn2.dispatchEvent(clickEvent);
		flushSync();

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

		btn1.dispatchEvent(clickEvent);
		flushSync();

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

		btn2.dispatchEvent(clickEvent);
		flushSync();

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

		btn1.dispatchEvent(clickEvent);
		flushSync();

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

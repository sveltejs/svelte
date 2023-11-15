import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, target, window }) {
		const btn = target.querySelector('button');
		ok(btn);

		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		assert.htmlEqual(
			window.document.head.innerHTML,
			'<style>body { color: blue; }</style><style>body { color: green; }</style>'
		);

		flushSync(() => btn.dispatchEvent(clickEvent));

		assert.htmlEqual(
			window.document.head.innerHTML,
			'<style>body { color: red; }</style><style>body { color: green; }</style>'
		);

		flushSync(() => btn.dispatchEvent(clickEvent));

		assert.htmlEqual(
			window.document.head.innerHTML,
			'<style>body { color: blue; }</style><style>body { color: green; }</style>'
		);
	}
});

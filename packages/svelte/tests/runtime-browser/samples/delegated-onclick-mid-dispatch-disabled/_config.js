import { test } from '../../assert';

export default test({
	// the test performs a real mouse click so the event is trusted
	// (`isTrusted === true`), which cannot be faked from inside the page
	real_click: true,

	async test({ assert, target, window, waitUntil }) {
		const span = target.querySelector('span');
		const rect = span.getBoundingClientRect();

		// a real user click: the browser flushes effects at the microtask
		// checkpoint between listeners, so the `{@attach}` handler's state
		// write disables the button mid-dispatch, before the event reaches
		// the delegated `onclick` at the root (#18070)
		await window.__real_click(rect.x + rect.width / 2, rect.y + rect.height / 2);

		await waitUntil(() => target.querySelector('p')?.textContent === 'attach: 1, onclick: 1');

		assert.htmlEqual(
			target.innerHTML,
			`<button disabled=""><span>click me</span></button><p>attach: 1, onclick: 1</p>`
		);
	}
});

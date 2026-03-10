import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	html: `<div id="editable" contenteditable="true"></div><p id="output"></p>`,

	test({ assert, target }) {
		const div = /** @type {HTMLDivElement} */ (target.querySelector('#editable'));
		const output = /** @type {HTMLParagraphElement} */ (target.querySelector('#output'));

		// Simulate user typing by directly modifying the DOM
		div.textContent = 'hello';

		// Simulate blur which triggers `content = e.currentTarget.innerText`
		const event = new Event('blur');
		div.dispatchEvent(event);
		flushSync();

		// The output should show "hello" (innerText was set correctly)
		assert.equal(output.textContent, 'hello');

		// The contenteditable div should contain "hello" once, not duplicated
		assert.htmlEqual(div.innerHTML, 'hello');
	}
});

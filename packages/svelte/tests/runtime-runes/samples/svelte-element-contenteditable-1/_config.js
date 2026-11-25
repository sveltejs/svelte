import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const h1 = /** @type {HTMLDivElement} */ (target.querySelector('h1'));

		assert.equal(h1.textContent, 'h');
		// don't use h1.textContent because h1.textContent will overwrite all childNodes
		// The childNode created by {myTextBlock.current} is the reason for duplication
		const textNode =
			[...h1.childNodes].findLast((n) => n.nodeType === Node.TEXT_NODE) ??
			h1.appendChild(document.createTextNode(''));
		textNode.nodeValue = 'he';
		h1.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.equal(h1.textContent, 'he');
	}
});

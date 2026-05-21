// Bootstrap a jsdom DOM environment for benchmarks that exercise DOM operations.
// Import this module before any code that touches DOM globals (e.g. before
// `svelte/internal/client` is asked to mount or render).

import { JSDOM } from 'jsdom';

if (typeof globalThis.document === 'undefined') {
	const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost/' });
	const win = dom.window;

	// Mirror the globals that Svelte's runtime expects in a browser. Some
	// globals (notably `navigator`) are read-only in modern Node, so we
	// assign via defineProperty and ignore failures rather than blowing up.
	/** @param {string} name @param {any} value */
	const define = (name, value) => {
		try {
			Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
		} catch {
			/* read-only — leave it alone */
		}
	};

	define('window', win);
	define('document', win.document);
	define('navigator', win.navigator);
	define('HTMLElement', win.HTMLElement);
	define('Element', win.Element);
	define('Node', win.Node);
	define('Text', win.Text);
	define('Comment', win.Comment);
	define('Event', win.Event);
	define('CustomEvent', win.CustomEvent);
	define('DocumentFragment', win.DocumentFragment);
	define('MutationObserver', win.MutationObserver);
	define('getComputedStyle', win.getComputedStyle.bind(win));
}

/**
 * Create a fresh detached container in `document.body` and return it.
 * @returns {HTMLDivElement}
 */
export function fresh_target() {
	const div = document.createElement('div');
	document.body.appendChild(div);
	return div;
}

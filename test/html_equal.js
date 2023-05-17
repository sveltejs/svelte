import { assert } from 'vitest';

/** @type {HTMLDivElement} */
let _container;

/**
 * @param {string} html
 * @param {{
 *  removeDataSvelte?: boolean,
 *  preserveComments?: boolean,
 * }} options
 */
export function normalize_html(html, options = {}) {
	const container = (_container ??= document.createElement('div'));

	if (!options.preserveComments) {
		html = html.replace(/(<!--.*?-->)/g, '');
	}

	if (options.removeDataSvelte) {
		html = html.replace(/(data-svelte-h="[^"]+")/g, '');
	}

	html = html.replace(/>[ \t\n\r\f]+</g, '><').trim();

	container.innerHTML = html;

	clean_children(container);

	return container.innerHTML.replace(/<\/?noscript\/?>/g, '');
}

/** @param {any} node */
function clean_children(node) {
	// sort attributes
	const attributes = Array.from(node.attributes).sort((a, b) => (a.name < b.name ? -1 : 1));

	attributes.forEach((attr) => {
		node.removeAttribute(attr.name);
	});

	attributes.forEach((attr) => {
		node.setAttribute(attr.name, attr.value);
	});

	let previous = null;
	// recurse
	[...node.childNodes].forEach((child) => {
		if (child.nodeType === 3) {
			// text
			if (
				node.namespaceURI === 'http://www.w3.org/2000/svg' &&
				node.tagName !== 'text' &&
				node.tagName !== 'tspan'
			) {
				node.removeChild(child);
			}

			child.data = child.data.replace(/[ \t\n\r\f]+/g, '\n');

			if (previous && previous.nodeType === 3) {
				previous.data += child.data;
				previous.data = previous.data.replace(/[ \t\n\r\f]+/g, '\n');

				node.removeChild(child);
				child = previous;
			}
		} else if (child.nodeType === 8) {
			// comment
			// do nothing
		} else {
			clean_children(child);
		}

		previous = child;
	});

	// collapse whitespace
	if (node.firstChild && node.firstChild.nodeType === 3) {
		node.firstChild.data = node.firstChild.data.replace(/^[ \t\n\r\f]+/, '');
		if (!node.firstChild.data.length) node.removeChild(node.firstChild);
	}

	if (node.lastChild && node.lastChild.nodeType === 3) {
		node.lastChild.data = node.lastChild.data.replace(/[ \t\n\r\f]+$/, '');
		if (!node.lastChild.data.length) node.removeChild(node.lastChild);
	}
}

/**
 *
 * @param {string} actual
 * @param {string} expected
 * @param {{
 *      message?: string,
 *      normalize_html?: {
 *         removeDataSvelte?: boolean,
 *        preserveComments?: boolean,
 *      },
 *      without_normalize?: boolean,
 * }} options
 */
export function assert_html_equal(actual, expected, options = {}) {
	if (options.without_normalize) {
		actual = actual.replace(/\r\n/g, '\n');
		expected = expected.replace(/\r\n/g, '\n');

		if (options.normalize_html.removeDataSvelte) {
			actual = actual.replace(/(\sdata-svelte-h="[^"]+")/g, '');
			expected = expected.replace(/(\sdata-svelte-h="[^"]+")/g, '');
		}
	} else {
		actual = normalize_html(actual, options.normalize_html);
		expected = normalize_html(expected, options.normalize_html);
	}

	try {
		assert.equal(actual, expected, options.message);
	} catch (err) {
		// Remove this function from the stack trace so that the error is shown in the test file

		if (Error.captureStackTrace) {
			Error.captureStackTrace(err, assert_html_equal);
		}
		throw err;
	}
}

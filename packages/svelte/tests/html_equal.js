import { COMMENT_NODE, ELEMENT_NODE, TEXT_NODE } from '#client/constants';
import { assert } from 'vitest';

/**
 * @param {Element} node
 * @param {{ preserveComments: boolean }} opts
 */
function clean_children(node, opts) {
	let previous = null;
	let has_element_children = false;
	let template =
		node.nodeName === 'TEMPLATE' ? /** @type {HTMLTemplateElement} */ (node) : undefined;

	if (template) {
		const div = document.createElement('div');
		div.append(template.content);
		node = div;
	}

	// sort attributes
	const attributes = Array.from(node.attributes).sort((a, b) => {
		return a.name < b.name ? -1 : 1;
	});

	attributes.forEach((attr) => {
		node.removeAttribute(attr.name);
	});

	attributes.forEach((attr) => {
		// Strip out the special onload/onerror hydration events from the test output
		if ((attr.name === 'onload' || attr.name === 'onerror') && attr.value === 'this.__e=event') {
			return;
		}

		let value = attr.value;

		if (attr.name === 'class') {
			value = value.replace(/svelte-\w+/, 'svelte-xyz123');
		}

		node.setAttribute(attr.name, value);
	});

	for (let child of [...node.childNodes]) {
		if (child.nodeType === TEXT_NODE) {
			let text = /** @type {Text} */ (child);

			if (
				node.namespaceURI === 'http://www.w3.org/2000/svg' &&
				node.tagName !== 'text' &&
				node.tagName !== 'tspan'
			) {
				node.removeChild(child);
				continue;
			}

			text.data = text.data.replace(/[^\S]+/g, ' ');

			if (previous && previous.nodeType === TEXT_NODE) {
				const prev = /** @type {Text} */ (previous);

				prev.data += text.data;
				node.removeChild(text);

				text = prev;
				text.data = text.data.replace(/[^\S]+/g, ' ');

				continue;
			}
		}

		if (child.nodeType === COMMENT_NODE && !opts.preserveComments) {
			// comment
			child.remove();
			continue;
		}

		// add newlines for better readability and potentially recurse into children
		if (child.nodeType === ELEMENT_NODE || child.nodeType === COMMENT_NODE) {
			if (previous?.nodeType === TEXT_NODE) {
				const prev = /** @type {Text} */ (previous);
				prev.data = prev.data.replace(/^[^\S]+$/, '\n');
			} else if (previous?.nodeType === ELEMENT_NODE || previous?.nodeType === COMMENT_NODE) {
				node.insertBefore(document.createTextNode('\n'), child);
			}

			if (child.nodeType === ELEMENT_NODE) {
				has_element_children = true;
				clean_children(/** @type {Element} */ (child), opts);
			}
		}

		previous = child;
	}

	// collapse whitespace
	if (node.firstChild && node.firstChild.nodeType === TEXT_NODE) {
		const text = /** @type {Text} */ (node.firstChild);
		text.data = text.data.trimStart();
	}

	if (node.lastChild && node.lastChild.nodeType === TEXT_NODE) {
		const text = /** @type {Text} */ (node.lastChild);
		text.data = text.data.trimEnd();
	}

	// indent code for better readability
	if (has_element_children && node.parentNode) {
		node.innerHTML = `\n\  ${node.innerHTML.replace(/\n/g, '\n  ')}\n`;
	}

	if (template) {
		template.innerHTML = node.innerHTML;
	}
}

/**
 * @param {Window} window
 * @param {string} html
 * @param {{ preserveComments?: boolean }} opts
 */
export function normalize_html(window, html, { preserveComments = false } = {}) {
	try {
		const node = window.document.createElement('div');

		node.innerHTML = html.trim();
		clean_children(node, { preserveComments });

		return node.innerHTML;
	} catch (err) {
		throw new Error(`Failed to normalize HTML:\n${html}\nCause: ${err}`);
	}
}

/**
 * @param {string} html
 * @returns {string}
 */
export function normalize_new_line(html) {
	return html.replace(/\r\n/g, '\n');
}

/**
 * @param {string} actual
 * @param {string} expected
 * @param {string} [message]
 */
export const assert_html_equal = (actual, expected, message) => {
	try {
		assert.deepEqual(normalize_html(window, actual), normalize_html(window, expected), message);
	} catch (e) {
		if (Error.captureStackTrace)
			Error.captureStackTrace(/** @type {Error} */ (e), assert_html_equal);
		throw e;
	}
};

/**
 *
 * @param {string} actual
 * @param {string} expected
 * @param {{ preserveComments?: boolean, withoutNormalizeHtml?: boolean }} param2
 * @param {string} [message]
 */
export const assert_html_equal_with_options = (
	actual,
	expected,
	{ preserveComments, withoutNormalizeHtml },
	message
) => {
	try {
		assert.deepEqual(
			withoutNormalizeHtml
				? normalize_new_line(actual.trim()).replace(
						/(<!(--)?.*?\2>)/g,
						preserveComments !== false ? '$1' : ''
					)
				: normalize_html(window, actual.trim(), { preserveComments }),
			withoutNormalizeHtml
				? normalize_new_line(expected.trim()).replace(
						/(<!(--)?.*?\2>)/g,
						preserveComments !== false ? '$1' : ''
					)
				: normalize_html(window, expected.trim(), { preserveComments }),
			message
		);
	} catch (e) {
		if (Error.captureStackTrace)
			Error.captureStackTrace(/** @type {Error} */ (e), assert_html_equal_with_options);
		throw e;
	}
};

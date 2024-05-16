import { assert } from 'vitest';

/** @param {Element} node */
function clean_children(node) {
	let previous = null;

	// sort attributes
	const attributes = Array.from(node.attributes).sort((a, b) => {
		return a.name < b.name ? -1 : 1;
	});

	attributes.forEach((attr) => {
		node.removeAttribute(attr.name);
	});

	attributes.forEach((attr) => {
		node.setAttribute(attr.name, attr.value);
	});

	for (let child of [...node.childNodes]) {
		if (child.nodeType === 3) {
			let text = /** @type {Text} */ (child);

			if (
				node.namespaceURI === 'http://www.w3.org/2000/svg' &&
				node.tagName !== 'text' &&
				node.tagName !== 'tspan'
			) {
				node.removeChild(child);
			}

			text.data = text.data.replace(/[ \t\n\r\f]+/g, '\n');

			if (previous && previous.nodeType === 3) {
				const prev = /** @type {Text} */ (previous);

				prev.data += text.data;
				prev.data = prev.data.replace(/[ \t\n\r\f]+/g, '\n');

				node.removeChild(text);
				text = prev;
			}
		} else if (child.nodeType === 8) {
			// comment
			// do nothing
		} else {
			clean_children(/** @type {Element} */ (child));
		}

		previous = child;
	}

	// collapse whitespace
	if (node.firstChild && node.firstChild.nodeType === 3) {
		const text = /** @type {Text} */ (node.firstChild);
		text.data = text.data.replace(/^[ \t\n\r\f]+/, '');
		if (!text.data.length) node.removeChild(text);
	}

	if (node.lastChild && node.lastChild.nodeType === 3) {
		const text = /** @type {Text} */ (node.lastChild);
		text.data = text.data.replace(/[ \t\n\r\f]+$/, '');
		if (!text.data.length) node.removeChild(text);
	}
}

/**
 * @param {Window} window
 * @param {string} html
 * @param {{ removeDataSvelte?: boolean, preserveComments?: boolean }} param2
 */
export function normalize_html(
	window,
	html,
	{ removeDataSvelte = false, preserveComments = false }
) {
	try {
		const node = window.document.createElement('div');
		node.innerHTML = html
			.replace(/(<!(--)?.*?\2>)/g, preserveComments ? '$1' : '')
			.replace(/(data-svelte-h="[^"]+")/g, removeDataSvelte ? '' : '$1')
			.replace(/>[ \t\n\r\f]+</g, '><')
			// Strip out the special onload/onerror hydration events from the test output
			.replace(/\s?onerror="this.__e=event"|\s?onload="this.__e=event"/g, '')
			.trim();
		clean_children(node);
		return node.innerHTML.replace(/<\/?noscript\/?>/g, '');
	} catch (err) {
		throw new Error(`Failed to normalize HTML:\n${html}`);
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
 * @param {{ removeDataSvelte?: boolean }} options
 */
export function setup_html_equal(options = {}) {
	/**
	 * @param {string} actual
	 * @param {string} expected
	 * @param {string} [message]
	 */
	const assert_html_equal = (actual, expected, message) => {
		try {
			assert.deepEqual(
				normalize_html(window, actual, options),
				normalize_html(window, expected, options),
				message
			);
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
	const assert_html_equal_with_options = (
		actual,
		expected,
		{ preserveComments, withoutNormalizeHtml },
		message
	) => {
		try {
			assert.deepEqual(
				withoutNormalizeHtml
					? normalize_new_line(actual.trim())
							.replace(/(\sdata-svelte-h="[^"]+")/g, options.removeDataSvelte ? '' : '$1')
							.replace(/(<!(--)?.*?\2>)/g, preserveComments !== false ? '$1' : '')
					: normalize_html(window, actual.trim(), { ...options, preserveComments }),
				withoutNormalizeHtml
					? normalize_new_line(expected.trim())
							.replace(/(\sdata-svelte-h="[^"]+")/g, options.removeDataSvelte ? '' : '$1')
							.replace(/(<!(--)?.*?\2>)/g, preserveComments !== false ? '$1' : '')
					: normalize_html(window, expected.trim(), { ...options, preserveComments }),
				message
			);
		} catch (e) {
			if (Error.captureStackTrace)
				Error.captureStackTrace(/** @type {Error} */ (e), assert_html_equal_with_options);
			throw e;
		}
	};

	return {
		assert_html_equal,
		assert_html_equal_with_options
	};
}

// Common case without options
export const { assert_html_equal, assert_html_equal_with_options } = setup_html_equal();

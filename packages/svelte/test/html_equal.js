import { assert } from 'vitest';

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
	}

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
			.replace(/(<!--.*?-->)/g, preserveComments ? '$1' : '')
			.replace(/(data-svelte-h="[^"]+")/g, removeDataSvelte ? '' : '$1')
			.replace(/>[ \t\n\r\f]+</g, '><')
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
			if (Error.captureStackTrace) Error.captureStackTrace(e, assert_html_equal);
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
					? normalize_new_line(actual).replace(
							/(\sdata-svelte-h="[^"]+")/g,
							options.removeDataSvelte ? '' : '$1'
					  )
					: normalize_html(window, actual, { ...options, preserveComments }),
				withoutNormalizeHtml
					? normalize_new_line(expected).replace(
							/(\sdata-svelte-h="[^"]+")/g,
							options.removeDataSvelte ? '' : '$1'
					  )
					: normalize_html(window, expected, { ...options, preserveComments }),
				message
			);
		} catch (e) {
			if (Error.captureStackTrace) Error.captureStackTrace(e, assert_html_equal_with_options);
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

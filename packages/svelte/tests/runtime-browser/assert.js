/**
 * @param {any} a
 * @param {any} b
 * @param {string} [message]
 */
export function deepEqual(a, b, message) {
	if (!is_equal(a, b)) {
		throw new Error(message || `Expected ${JSON.stringify(a)} to equal ${JSON.stringify(b)}`);
	}
}

/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
function is_equal(a, b) {
	if (a && typeof a === 'object') {
		const is_array = Array.isArray(a);
		if (Array.isArray(b) !== is_array) return false;

		if (is_array) {
			if (a.length !== b.length) return false;
			return a.every((value, i) => is_equal(value, b[i]));
		}

		const a_keys = Object.keys(a).sort();
		const b_keys = Object.keys(b).sort();
		if (a_keys.join(',') !== b_keys.join(',')) return false;

		return a_keys.every((key) => is_equal(a[key], b[key]));
	}

	return a === b;
}
/**
 * @param {any} a
 * @param {any} b
 * @param {string} [message]
 */
export function equal(a, b, message) {
	if (a != b) throw new Error(message || `Expected ${a} to equal ${b}`);
}
/**
 * @param {any} condition
 * @param {string} [message]
 */
export function ok(condition, message) {
	if (!condition) throw new Error(message || `Expected ${condition} to be truthy`);
}

/**
 * @param {any} actual
 * @param {any} expected
 * @param {string} [message]
 */
export function htmlEqual(actual, expected, message) {
	return deepEqual(normalize_html(window, actual), normalize_html(window, expected), message);
}

/**
 * @param {Window} window
 * @param {string} html
 */
function normalize_html(window, html) {
	try {
		const node = window.document.createElement('div');
		node.innerHTML = html
			.replace(/<!--.*?-->/g, '')
			.replace(/>[\s\r\n]+</g, '><')
			.trim();

		normalize_children(node);

		return node.innerHTML.replace(/<\/?noscript\/?>/g, '');
	} catch (err) {
		throw new Error(`Failed to normalize HTML:\n${html}`);
	}
}

/** @param {any} node */
function normalize_children(node) {
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

	// normalize styles
	if (node.hasAttribute('style')) {
		node.style = node.style.cssText;
	}

	for (let child of [...node.childNodes]) {
		if (child.nodeType === 1 /* Element */) {
			normalize_children(child);
		}
	}
}

// The following two functions need to be in here; if we had them in test.ts, esbuild would choke on node imports etc

/**
 * @template Props
 * @param {{
 *	skip?: boolean;
 *	solo?: boolean;
 *  mode?: Array<'server' | 'client' | 'hydrate'>;
 *  skip_mode?: Array<'server' | 'client' | 'hydrate'>;
 *	html?: string;
 *	ssrHtml?: string;
 *	props?: Props;
 *	compileOptions?: Partial<import('#compiler').CompileOptions>;
 *	test?: (args: {
 *		assert: typeof import('vitest').assert & {
 *			htmlEqual(a: string, b: string, description?: string): void;
 *			htmlEqualWithOptions(
 *				a: string,
 *				b: string,
 *				opts: { preserveComments: boolean; withoutNormalizeHtml: boolean },
 *				description?: string
 *			): void;
 *		};
 *		compileOptions: import('#compiler').CompileOptions;
 *		component: Props & {
 *			[key: string]: any;
 *		};
 *		componentCtor: any;
 *		mod: any;
 *		raf: {
 *			tick: (ms: number) => void;
 *		};
 *		target: HTMLElement;
 *		window: Window & {
 *			Event: typeof Event;
 *			InputEvent: typeof InputEvent;
 *			KeyboardEvent: typeof KeyboardEvent;
 *			MouseEvent: typeof MouseEvent;
 *		};
 *		waitUntil: (fn: any, ms?: number) => Promise<void>;
 *	}) => void;
 *	accessors?: boolean;
 *	immutable?: boolean;
 *	dev?: boolean;
 *	warnings?: import('#compiler').Warning[];
 *}} args
 */
export function test(args) {
	return args;
}

// TypeScript needs the type of assertions to be directly visible, not infered, which is why
// we can't have it on the test suite type.
/**
 * @param {any} value
 * @returns {asserts value}
 */
export function assert_ok(value) {
	if (!value) {
		throw new Error(`Expected truthy value, got ${value}`);
	}
}

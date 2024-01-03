import {
	regex_ends_with_whitespaces,
	regex_not_whitespace,
	regex_starts_with_whitespaces,
	regex_whitespaces_strict
} from '../patterns.js';
import * as b from '../../utils/builders.js';

/**
 * @param {string} s
 * @param {boolean} [attr]
 */
export function escape_html(s, attr) {
	if (typeof s !== 'string') return s;
	const delimiter = attr ? '"' : '<';
	const escaped_delimiter = attr ? '&quot;' : '&lt;';
	let i_delimiter = s.indexOf(delimiter);
	let i_ampersand = s.indexOf('&');

	if (i_delimiter < 0 && i_ampersand < 0) return s;

	let left = 0,
		out = '';

	while (i_delimiter >= 0 && i_ampersand >= 0) {
		if (i_delimiter < i_ampersand) {
			if (left < i_delimiter) out += s.substring(left, i_delimiter);
			out += escaped_delimiter;
			left = i_delimiter + 1;
			i_delimiter = s.indexOf(delimiter, left);
		} else {
			if (left < i_ampersand) out += s.substring(left, i_ampersand);
			out += '&amp;';
			left = i_ampersand + 1;
			i_ampersand = s.indexOf('&', left);
		}
	}

	if (i_delimiter >= 0) {
		do {
			if (left < i_delimiter) out += s.substring(left, i_delimiter);
			out += escaped_delimiter;
			left = i_delimiter + 1;
			i_delimiter = s.indexOf(delimiter, left);
		} while (i_delimiter >= 0);
	} else if (!attr) {
		while (i_ampersand >= 0) {
			if (left < i_ampersand) out += s.substring(left, i_ampersand);
			out += '&amp;';
			left = i_ampersand + 1;
			i_ampersand = s.indexOf('&', left);
		}
	}

	return left < s.length ? out + s.substring(left) : out;
}

/**
 * @param {import('estree').Node} node
 * @returns {boolean}
 */
export function is_hoistable_function(node) {
	if (
		node.type === 'ArrowFunctionExpression' ||
		node.type === 'FunctionExpression' ||
		node.type === 'FunctionDeclaration'
	) {
		return node.metadata?.hoistable === true;
	}
	return false;
}

/**
 * Extract nodes that are hoisted and trim whitespace according to the following rules:
 * - trim leading and trailing whitespace, regardless of surroundings
 * - keep leading / trailing whitespace of inbetween text nodes,
 *   unless it's whitespace-only, in which case collapse to a single whitespace for all cases
 *   except when it's children of certain elements where we know ignore whitespace (like td/option/head),
 *   in which case we remove it entirely
 * @param {import('#compiler').SvelteNode} parent
 * @param {import('#compiler').SvelteNode[]} nodes
 * @param {import('#compiler').SvelteNode[]} path
 * @param {import('#compiler').Namespace} namespace
 * @param {boolean} preserve_whitespace
 * @param {boolean} preserve_comments
 */
export function clean_nodes(
	parent,
	nodes,
	path,
	namespace = 'html',
	preserve_whitespace,
	preserve_comments
) {
	/** @type {import('#compiler').SvelteNode[]} */
	const hoisted = [];

	/** @type {import('#compiler').SvelteNode[]} */
	const regular = [];

	for (const node of nodes) {
		if (node.type === 'Comment' && !preserve_comments) {
			continue;
		}

		if (
			node.type === 'ConstTag' ||
			node.type === 'DebugTag' ||
			node.type === 'SvelteBody' ||
			node.type === 'SvelteWindow' ||
			node.type === 'SvelteDocument' ||
			node.type === 'SvelteHead' ||
			node.type === 'TitleElement' ||
			node.type === 'SnippetBlock'
		) {
			// TODO others?
			hoisted.push(node);
		} else {
			regular.push(node);
		}
	}

	if (preserve_whitespace) {
		return { hoisted, trimmed: regular };
	}

	let first, last;

	while ((first = regular[0]) && first.type === 'Text' && !regex_not_whitespace.test(first.data)) {
		regular.shift();
	}

	if (first?.type === 'Text') {
		first.raw = first.raw.replace(regex_starts_with_whitespaces, '');
		first.data = first.data.replace(regex_starts_with_whitespaces, '');
	}

	while ((last = regular.at(-1)) && last.type === 'Text' && !regex_not_whitespace.test(last.data)) {
		regular.pop();
	}

	if (last?.type === 'Text') {
		last.raw = last.raw.replace(regex_ends_with_whitespaces, '');
		last.data = last.data.replace(regex_ends_with_whitespaces, '');
	}

	const can_remove_entirely =
		(namespace === 'svg' &&
			(parent.type !== 'RegularElement' || parent.name !== 'text') &&
			!path.some((n) => n.type === 'RegularElement' && n.name === 'text')) ||
		(parent.type === 'RegularElement' &&
			// TODO others?
			(parent.name === 'select' ||
				parent.name === 'tr' ||
				parent.name === 'table' ||
				parent.name === 'tbody' ||
				parent.name === 'thead' ||
				parent.name === 'tfoot' ||
				parent.name === 'colgroup' ||
				parent.name === 'datalist'));

	/** @type {import('#compiler').SvelteNode[]} */
	const trimmed = [];

	/** @type {import('#compiler').Text | null} */
	let last_text = null;

	// Replace any inbetween whitespace with a single space
	for (const node of regular) {
		if (node.type === 'Text') {
			node.data = node.data.replace(regex_whitespaces_strict, ' ');
			node.raw = node.raw.replace(regex_whitespaces_strict, ' ');
			if (
				(last_text === null && !can_remove_entirely) ||
				node.data !== ' ' ||
				node.data.charCodeAt(0) === 160 // non-breaking space
			) {
				trimmed.push(node);
			}
			last_text = node;
		} else {
			last_text = null;
			trimmed.push(node);
		}
	}

	return { hoisted, trimmed };
}

/**
 * Infers the new namespace for the children of a node.
 * @param {import('#compiler').Namespace} namespace
 * @param {import('#compiler').SvelteNode} parent
 * @param {import('#compiler').SvelteNode[]} nodes
 * @param {import('#compiler').SvelteNode[]} path
 */
export function infer_namespace(namespace, parent, nodes, path) {
	const parent_node =
		parent.type === 'Fragment'
			? // Messy: We know that Fragment calls create_block directly, so we can do this here
			  path.at(-1)
			: parent;

	if (
		namespace !== 'foreign' &&
		// Re-evaluate the namespace inside slot nodes that reset the namespace
		(parent_node === undefined ||
			parent_node.type === 'Root' ||
			parent_node.type === 'Component' ||
			parent_node.type === 'SvelteComponent' ||
			parent_node.type === 'SvelteFragment' ||
			parent_node.type === 'SnippetBlock')
	) {
		// Heuristic: Keep current namespace, unless we find a regular element,
		// in which case we always want html, or we only find svg nodes,
		// in which case we assume svg.
		let only_svg = true;
		for (const node of nodes) {
			if (node.type === 'RegularElement') {
				if (!node.metadata.svg) {
					namespace = 'html';
					only_svg = false;
					break;
				}
			} else if (node.type !== 'Text' || node.data.trim() !== '') {
				only_svg = false;
			}
		}
		if (only_svg) {
			namespace = 'svg';
		}
	}

	return namespace;
}

/**
 * @param {import('#compiler').RegularElement} node
 * @param {import('#compiler').Namespace} namespace
 * @param {import('#compiler').SvelteNode[]} path
 * @returns {import('#compiler').Namespace}
 */
export function determine_element_namespace(node, namespace, path) {
	if (namespace !== 'foreign') {
		let parent = path.at(-1);
		if (parent?.type === 'Fragment') {
			parent = path.at(-2);
		}

		if (node.name === 'foreignObject') {
			return 'html';
		} else if (
			namespace !== 'svg' ||
			parent?.type === 'Component' ||
			parent?.type === 'SvelteComponent' ||
			parent?.type === 'SvelteFragment' ||
			parent?.type === 'SnippetBlock'
		) {
			if (node.metadata.svg) {
				return 'svg';
			} else {
				return 'html';
			}
		}
	}

	return namespace;
}

/**
 * @template {import('./types.js').TransformState} T
 * @param {import('estree').CallExpression} node
 * @param {import('zimmerframe').Context<any, T>} context
 */
export function transform_inspect_rune(node, context) {
	const { state, visit } = context;
	const as_fn = state.options.generate === 'client';

	if (!state.options.dev) return b.unary('void', b.literal(0));

	if (node.callee.type === 'MemberExpression') {
		const raw_inspect_args = /** @type {import('estree').CallExpression} */ (node.callee.object)
			.arguments;
		const inspect_args =
			/** @type {Array<import('estree').Expression>} */
			(raw_inspect_args.map((arg) => visit(arg)));
		const with_arg = /** @type {import('estree').Expression} */ (visit(node.arguments[0]));

		return b.call(
			'$.inspect',
			as_fn ? b.thunk(b.array(inspect_args)) : b.array(inspect_args),
			with_arg
		);
	} else {
		const arg = node.arguments.map(
			(arg) => /** @type {import('estree').Expression} */ (visit(arg))
		);
		return b.call('$.inspect', as_fn ? b.thunk(b.array(arg)) : b.array(arg));
	}
}

/** @import { Context } from 'zimmerframe' */
/** @import { TransformState } from './types.js' */
/** @import * as Compiler from '#compiler' */
/** @import { Node, Expression, CallExpression } from 'estree' */
import {
	regex_ends_with_whitespaces,
	regex_not_whitespace,
	regex_starts_with_whitespaces
} from '../patterns.js';
import * as b from '../../utils/builders.js';
import * as e from '../../errors.js';
import { walk } from 'zimmerframe';
import { extract_identifiers } from '../../utils/ast.js';
import check_graph_for_cycles from '../2-analyze/utils/check_graph_for_cycles.js';
import is_reference from 'is-reference';
import { set_scope } from '../scope.js';
import { dev } from '../../state.js';

/**
 * @param {Node} node
 * @returns {boolean}
 */
export function is_hoisted_function(node) {
	if (
		node.type === 'ArrowFunctionExpression' ||
		node.type === 'FunctionExpression' ||
		node.type === 'FunctionDeclaration'
	) {
		return node.metadata?.hoisted === true;
	}
	return false;
}

/**
 * Match Svelte 4 behaviour by sorting ConstTag nodes in topological order
 * @param {Compiler.SvelteNode[]} nodes
 * @param {TransformState} state
 */
function sort_const_tags(nodes, state) {
	/**
	 * @typedef {{
	 *   node: Compiler.ConstTag;
	 *   deps: Set<Compiler.Binding>;
	 * }} Tag
	 */

	const other = [];

	/** @type {Map<Compiler.Binding, Tag>} */
	const tags = new Map();

	for (const node of nodes) {
		if (node.type === 'ConstTag') {
			const declaration = node.declaration.declarations[0];

			const bindings = extract_identifiers(declaration.id).map((id) => {
				return /** @type {Compiler.Binding} */ (state.scope.get(id.name));
			});

			/** @type {Set<Compiler.Binding>} */
			const deps = new Set();

			walk(declaration.init, state, {
				// @ts-expect-error don't know, don't care
				_: set_scope,
				Identifier(node, context) {
					const parent = /** @type {Expression} */ (context.path.at(-1));

					if (is_reference(node, parent)) {
						const binding = context.state.scope.get(node.name);
						if (binding) deps.add(binding);
					}
				}
			});

			for (const binding of bindings) {
				tags.set(binding, { node, deps });
			}
		} else {
			other.push(node);
		}
	}

	if (tags.size === 0) {
		return nodes;
	}

	/** @type {Array<[Compiler.Binding, Compiler.Binding]>} */
	const edges = [];

	for (const [id, tag] of tags) {
		for (const dep of tag.deps) {
			if (tags.has(dep)) {
				edges.push([id, dep]);
			}
		}
	}

	const cycle = check_graph_for_cycles(edges);
	if (cycle?.length) {
		const tag = /** @type {Tag} */ (tags.get(cycle[0]));
		e.const_tag_cycle(tag.node, cycle.map((binding) => binding.node.name).join(' → '));
	}

	/** @type {Compiler.ConstTag[]} */
	const sorted = [];

	/** @param {Tag} tag */
	function add(tag) {
		if (sorted.includes(tag.node)) {
			return;
		}

		for (const dep of tag.deps) {
			const dep_tag = tags.get(dep);
			if (dep_tag) add(dep_tag);
		}

		sorted.push(tag.node);
	}

	for (const tag of tags.values()) {
		add(tag);
	}

	return [...sorted, ...other];
}

/**
 * Extract nodes that are hoisted and trim whitespace according to the following rules:
 * - trim leading and trailing whitespace, regardless of surroundings
 * - keep leading / trailing whitespace of inbetween text nodes,
 *   unless it's whitespace-only, in which case collapse to a single whitespace for all cases
 *   except when it's children of certain elements where we know ignore whitespace (like td/option/head),
 *   in which case we remove it entirely
 * @param {Compiler.SvelteNode} parent
 * @param {Compiler.SvelteNode[]} nodes
 * @param {Compiler.SvelteNode[]} path
 * @param {Compiler.Namespace} namespace
 * @param {TransformState & { options: Compiler.ValidatedCompileOptions }} state
 * @param {boolean} preserve_whitespace
 * @param {boolean} preserve_comments
 */
export function clean_nodes(
	parent,
	nodes,
	path,
	namespace = 'html',
	state,
	// TODO give these defaults (state.options.preserveWhitespace and state.options.preserveComments).
	// first, we need to make `Component(Client|Server)TransformState` inherit from a new `ComponentTransformState`
	// rather than from `ClientTransformState` and `ServerTransformState`
	preserve_whitespace,
	preserve_comments
) {
	if (!state.analysis.runes) {
		nodes = sort_const_tags(nodes, state);
	}

	/** @type {Compiler.SvelteNode[]} */
	const hoisted = [];

	/** @type {Compiler.SvelteNode[]} */
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

	let trimmed = regular;

	if (!preserve_whitespace) {
		trimmed = [];

		let first, last;

		while (
			(first = regular[0]) &&
			first.type === 'Text' &&
			!regex_not_whitespace.test(first.data)
		) {
			regular.shift();
		}

		if (first?.type === 'Text') {
			first.raw = first.raw.replace(regex_starts_with_whitespaces, '');
			first.data = first.data.replace(regex_starts_with_whitespaces, '');
		}

		while (
			(last = regular.at(-1)) &&
			last.type === 'Text' &&
			!regex_not_whitespace.test(last.data)
		) {
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

		// Replace any whitespace between a text and non-text node with a single spaceand keep whitespace
		// as-is within text nodes, or between text nodes and expression tags (because in the end they count
		// as one text). This way whitespace is mostly preserved when using CSS with `white-space: pre-line`
		// and default slot content going into a pre tag (which we can't see).
		for (let i = 0; i < regular.length; i++) {
			const prev = regular[i - 1];
			const node = regular[i];
			const next = regular[i + 1];

			if (node.type === 'Text') {
				if (prev?.type !== 'ExpressionTag') {
					const prev_is_text_ending_with_whitespace =
						prev?.type === 'Text' && regex_ends_with_whitespaces.test(prev.data);
					node.data = node.data.replace(
						regex_starts_with_whitespaces,
						prev_is_text_ending_with_whitespace ? '' : ' '
					);
					node.raw = node.raw.replace(
						regex_starts_with_whitespaces,
						prev_is_text_ending_with_whitespace ? '' : ' '
					);
				}
				if (next?.type !== 'ExpressionTag') {
					node.data = node.data.replace(regex_ends_with_whitespaces, ' ');
					node.raw = node.raw.replace(regex_ends_with_whitespaces, ' ');
				}
				if (node.data && (node.data !== ' ' || !can_remove_entirely)) {
					trimmed.push(node);
				}
			} else {
				trimmed.push(node);
			}
		}
	}

	var first = trimmed[0];

	return {
		hoisted,
		trimmed,
		/**
		 * In a case like `{#if x}<Foo />{/if}`, we don't need to wrap the child in
		 * comments — we can just use the parent block's anchor for the component.
		 * TODO extend this optimisation to other cases
		 */
		is_standalone:
			trimmed.length === 1 &&
			((first.type === 'RenderTag' && !first.metadata.dynamic) ||
				(first.type === 'Component' &&
					!state.options.hmr &&
					!first.metadata.dynamic &&
					!first.attributes.some(
						(attribute) => attribute.type === 'Attribute' && attribute.name.startsWith('--')
					))),
		/** if a component or snippet starts with text, we need to add an anchor comment so that its text node doesn't get fused with its surroundings */
		is_text_first:
			(parent.type === 'Fragment' ||
				parent.type === 'SnippetBlock' ||
				parent.type === 'SvelteComponent' ||
				parent.type === 'Component' ||
				parent.type === 'SvelteSelf') &&
			first &&
			(first?.type === 'Text' || first?.type === 'ExpressionTag')
	};
}

/**
 * Infers the namespace for the children of a node that should be used when creating the `$.template(...)`.
 * @param {Compiler.Namespace} namespace
 * @param {Compiler.SvelteNode} parent
 * @param {Compiler.SvelteNode[]} nodes
 */
export function infer_namespace(namespace, parent, nodes) {
	if (namespace !== 'foreign') {
		if (parent.type === 'RegularElement' && parent.name === 'foreignObject') {
			return 'html';
		}

		if (parent.type === 'RegularElement' || parent.type === 'SvelteElement') {
			if (parent.metadata.svg) {
				return 'svg';
			}
			return parent.metadata.mathml ? 'mathml' : 'html';
		}

		// Re-evaluate the namespace inside slot nodes that reset the namespace
		if (
			parent.type === 'Fragment' ||
			parent.type === 'Root' ||
			parent.type === 'Component' ||
			parent.type === 'SvelteComponent' ||
			parent.type === 'SvelteFragment' ||
			parent.type === 'SnippetBlock' ||
			parent.type === 'SlotElement'
		) {
			const new_namespace = check_nodes_for_namespace(nodes, 'keep');
			if (new_namespace !== 'keep' && new_namespace !== 'maybe_html') {
				return new_namespace;
			}
		}
	}

	return namespace;
}

/**
 * Heuristic: Keep current namespace, unless we find a regular element,
 * in which case we always want html, or we only find svg nodes,
 * in which case we assume svg.
 * @param {Compiler.SvelteNode[]} nodes
 * @param {Compiler.Namespace | 'keep' | 'maybe_html'} namespace
 */
function check_nodes_for_namespace(nodes, namespace) {
	/**
	 * @param {Compiler.SvelteElement | Compiler.RegularElement} node}
	 * @param {{stop: () => void}} context
	 */
	const RegularElement = (node, { stop }) => {
		if (!node.metadata.svg && !node.metadata.mathml) {
			namespace = 'html';
			stop();
		} else if (namespace === 'keep') {
			namespace = node.metadata.svg ? 'svg' : 'mathml';
		}
	};

	for (const node of nodes) {
		walk(
			node,
			{},
			{
				_(node, { next }) {
					if (
						node.type === 'EachBlock' ||
						node.type === 'IfBlock' ||
						node.type === 'AwaitBlock' ||
						node.type === 'Fragment' ||
						node.type === 'KeyBlock' ||
						node.type === 'RegularElement' ||
						node.type === 'SvelteElement' ||
						node.type === 'Text'
					) {
						next();
					}
				},
				SvelteElement: RegularElement,
				RegularElement,
				Text(node) {
					if (node.data.trim() !== '') {
						namespace = 'maybe_html';
					}
				}
			}
		);

		if (namespace === 'html') return namespace;
	}

	return namespace;
}

/**
 * Determines the namespace the children of this node are in.
 * @param {Compiler.RegularElement | Compiler.SvelteElement} node
 * @param {Compiler.Namespace} namespace
 * @returns {Compiler.Namespace}
 */
export function determine_namespace_for_children(node, namespace) {
	if (namespace === 'foreign') {
		return namespace;
	}

	if (node.name === 'foreignObject') {
		return 'html';
	}

	if (node.metadata.svg) {
		return 'svg';
	}

	return node.metadata.mathml ? 'mathml' : 'html';
}

/**
 * @template {TransformState} T
 * @param {CallExpression} node
 * @param {Context<any, T>} context
 */
export function transform_inspect_rune(node, context) {
	const { state, visit } = context;
	const as_fn = state.options.generate === 'client';

	if (!dev) return b.empty;

	if (node.callee.type === 'MemberExpression') {
		const raw_inspect_args = /** @type {CallExpression} */ (node.callee.object).arguments;
		const inspect_args =
			/** @type {Array<Expression>} */
			(raw_inspect_args.map((arg) => visit(arg)));
		const with_arg = /** @type {Expression} */ (visit(node.arguments[0]));

		return b.call(
			'$.inspect',
			as_fn ? b.thunk(b.array(inspect_args)) : b.array(inspect_args),
			with_arg
		);
	} else {
		const arg = node.arguments.map((arg) => /** @type {Expression} */ (visit(arg)));
		return b.call('$.inspect', as_fn ? b.thunk(b.array(arg)) : b.array(arg));
	}
}

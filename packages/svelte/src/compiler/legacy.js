/** @import { Expression } from 'estree' */
/** @import { AST, SvelteNode, TemplateNode } from '#compiler' */
/** @import * as Legacy from './types/legacy-nodes.js' */
import { walk } from 'zimmerframe';
import {
	regex_ends_with_whitespaces,
	regex_not_whitespace,
	regex_starts_with_whitespaces
} from './phases/patterns.js';
import { extract_svelte_ignore } from './utils/extract_svelte_ignore.js';

/**
 * Some of the legacy Svelte AST nodes remove whitespace from the start and end of their children.
 * @param {TemplateNode[]} nodes
 */
function remove_surrounding_whitespace_nodes(nodes) {
	const first = nodes.at(0);
	const last = nodes.at(-1);

	if (first?.type === 'Text') {
		if (!regex_not_whitespace.test(first.data)) {
			nodes.shift();
		} else {
			first.data = first.data.replace(regex_starts_with_whitespaces, '');
		}
	}
	if (last?.type === 'Text') {
		if (!regex_not_whitespace.test(last.data)) {
			nodes.pop();
		} else {
			last.data = last.data.replace(regex_ends_with_whitespaces, '');
		}
	}
}

/**
 * Transform our nice modern AST into the monstrosity emitted by Svelte 4
 * @param {string} source
 * @param {AST.Root} ast
 * @returns {Legacy.LegacyRoot}
 */
export function convert(source, ast) {
	const root = /** @type {SvelteNode | Legacy.LegacySvelteNode} */ (ast);

	return /** @type {Legacy.LegacyRoot} */ (
		walk(root, null, {
			_(node, { next }) {
				// @ts-ignore
				delete node.parent;
				// @ts-ignore
				delete node.metadata;
				next();
			},
			// @ts-ignore
			Root(node, { visit }) {
				const { instance, module, options } = node;

				// Insert svelte:options back into the root nodes
				if (/** @type {any} */ (options)?.__raw__) {
					let idx = node.fragment.nodes.findIndex((node) => options.end <= node.start);
					if (idx === -1) {
						idx = node.fragment.nodes.length;
					}

					// @ts-ignore
					delete options.__raw__.parent;
					node.fragment.nodes.splice(idx, 0, /** @type {any} */ (options).__raw__);
				}

				/** @type {number | null} */
				let start = null;

				/** @type {number | null} */
				let end = null;

				if (node.fragment.nodes.length > 0) {
					const first = /** @type {AST.BaseNode} */ (node.fragment.nodes.at(0));
					const last = /** @type {AST.BaseNode} */ (node.fragment.nodes.at(-1));

					start = first.start;
					end = last.end;

					while (/\s/.test(source[start])) start += 1;
					while (/\s/.test(source[end - 1])) end -= 1;
				}

				if (instance) {
					// @ts-ignore
					delete instance.parent;
					// @ts-ignore
					delete instance.attributes;
				}

				if (module) {
					// @ts-ignore
					delete module.parent;
					// @ts-ignore
					delete module.attributes;
				}

				return {
					html: {
						type: 'Fragment',
						start,
						end,
						children: node.fragment.nodes.map((child) => visit(child))
					},
					instance,
					module,
					css: ast.css ? visit(ast.css) : undefined
				};
			},
			AnimateDirective(node) {
				return { ...node, type: 'Animation' };
			},
			// @ts-ignore
			AwaitBlock(node, { visit }) {
				let pendingblock = {
					type: 'PendingBlock',
					/** @type {number | null} */
					start: null,
					/** @type {number | null} */
					end: null,
					children: node.pending?.nodes.map((child) => visit(child)) ?? [],
					skip: true
				};

				let thenblock = {
					type: 'ThenBlock',
					/** @type {number | null} */
					start: null,
					/** @type {number | null} */
					end: null,
					children: node.then?.nodes.map((child) => visit(child)) ?? [],
					skip: true
				};

				let catchblock = {
					type: 'CatchBlock',
					/** @type {number | null} */
					start: null,
					/** @type {number | null} */
					end: null,
					children: node.catch?.nodes.map((child) => visit(child)) ?? [],
					skip: true
				};

				if (node.pending) {
					const first = node.pending.nodes.at(0);
					const last = node.pending.nodes.at(-1);

					pendingblock.start = first?.start ?? source.indexOf('}', node.expression.end) + 1;
					pendingblock.end = last?.end ?? pendingblock.start;
					pendingblock.skip = false;
				}

				if (node.then) {
					const first = node.then.nodes.at(0);
					const last = node.then.nodes.at(-1);

					thenblock.start =
						pendingblock.end ?? first?.start ?? source.indexOf('}', node.expression.end) + 1;
					thenblock.end =
						last?.end ?? source.lastIndexOf('}', pendingblock.end ?? node.expression.end) + 1;
					thenblock.skip = false;
				}

				if (node.catch) {
					const first = node.catch.nodes.at(0);
					const last = node.catch.nodes.at(-1);

					catchblock.start =
						thenblock.end ??
						pendingblock.end ??
						first?.start ??
						source.indexOf('}', node.expression.end) + 1;
					catchblock.end =
						last?.end ??
						source.lastIndexOf('}', thenblock.end ?? pendingblock.end ?? node.expression.end) + 1;
					catchblock.skip = false;
				}

				return {
					type: 'AwaitBlock',
					start: node.start,
					end: node.end,
					expression: node.expression,
					value: node.value,
					error: node.error,
					pending: pendingblock,
					then: thenblock,
					catch: catchblock
				};
			},
			BindDirective(node) {
				return { ...node, type: 'Binding' };
			},
			ClassDirective(node) {
				return { ...node, type: 'Class' };
			},
			Comment(node) {
				return {
					...node,
					ignores: extract_svelte_ignore(node.start, node.data, false)
				};
			},
			ComplexSelector(node) {
				const children = [];

				for (const child of node.children) {
					if (child.combinator) {
						children.push(child.combinator);
					}

					children.push(...child.selectors);
				}

				return {
					type: 'Selector',
					start: node.start,
					end: node.end,
					children
				};
			},
			Component(node, { visit }) {
				return {
					type: 'InlineComponent',
					start: node.start,
					end: node.end,
					name: node.name,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			// @ts-ignore
			ConstTag(node) {
				if (/** @type {Legacy.LegacyConstTag} */ (node).expression !== undefined) {
					return node;
				}

				const modern_node = /** @type {AST.ConstTag} */ (node);
				const { id: left } = { ...modern_node.declaration.declarations[0] };
				// @ts-ignore
				delete left.typeAnnotation;
				return {
					type: 'ConstTag',
					start: modern_node.start,
					end: node.end,
					expression: {
						type: 'AssignmentExpression',
						start: (modern_node.declaration.start ?? 0) + 'const '.length,
						end: modern_node.declaration.end ?? 0,
						operator: '=',
						left,
						right: modern_node.declaration.declarations[0].init
					}
				};
			},
			// @ts-ignore
			KeyBlock(node, { visit }) {
				remove_surrounding_whitespace_nodes(node.fragment.nodes);
				return {
					type: 'KeyBlock',
					start: node.start,
					end: node.end,
					expression: node.expression,
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			// @ts-ignore
			EachBlock(node, { visit }) {
				let elseblock = undefined;

				if (node.fallback) {
					const first = node.fallback.nodes.at(0);
					const end = source.lastIndexOf('{', /** @type {number} */ (node.end) - 1);
					const start = first?.start ?? end;

					remove_surrounding_whitespace_nodes(node.fallback.nodes);

					elseblock = {
						type: 'ElseBlock',
						start,
						end,
						children: node.fallback.nodes.map((child) => visit(child))
					};
				}

				remove_surrounding_whitespace_nodes(node.body.nodes);

				return {
					type: 'EachBlock',
					start: node.start,
					end: node.end,
					children: node.body.nodes.map((child) => visit(child)),
					context: node.context,
					expression: node.expression,
					index: node.index,
					key: node.key,
					else: elseblock
				};
			},
			ExpressionTag(node, { path }) {
				const parent = path.at(-1);
				if (parent?.type === 'Attribute') {
					if (source[parent.start] === '{') {
						return {
							type: 'AttributeShorthand',
							start: node.start,
							end: node.end,
							expression: node.expression
						};
					}
				}

				return {
					type: 'MustacheTag',
					start: node.start,
					end: node.end,
					expression: node.expression
				};
			},
			HtmlTag(node) {
				return { ...node, type: 'RawMustacheTag' };
			},
			// @ts-ignore
			IfBlock(node, { visit }) {
				let elseblock = undefined;
				if (node.alternate) {
					let nodes = node.alternate.nodes;
					if (nodes.length === 1 && nodes[0].type === 'IfBlock' && nodes[0].elseif) {
						nodes = nodes[0].consequent.nodes;
					}

					const end = source.lastIndexOf('{', /** @type {number} */ (node.end) - 1);
					const start = nodes.at(0)?.start ?? end;

					remove_surrounding_whitespace_nodes(node.alternate.nodes);

					elseblock = {
						type: 'ElseBlock',
						start,
						end: end,
						children: node.alternate.nodes.map(
							(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
						)
					};
				}

				const start = node.elseif
					? node.consequent.nodes[0]?.start ??
						source.lastIndexOf('{', /** @type {number} */ (node.end) - 1)
					: node.start;

				remove_surrounding_whitespace_nodes(node.consequent.nodes);

				return {
					type: 'IfBlock',
					start,
					end: node.end,
					expression: node.test,
					children: node.consequent.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					),
					else: elseblock,
					elseif: node.elseif ? true : undefined
				};
			},
			OnDirective(node) {
				return { ...node, type: 'EventHandler' };
			},
			// @ts-expect-error
			SnippetBlock(node, { visit }) {
				remove_surrounding_whitespace_nodes(node.body.nodes);
				return {
					type: 'SnippetBlock',
					start: node.start,
					end: node.end,
					expression: node.expression,
					parameters: node.parameters,
					children: node.body.nodes.map((child) => visit(child))
				};
			},
			RegularElement(node, { visit }) {
				return {
					type: 'Element',
					start: node.start,
					end: node.end,
					name: node.name,
					attributes: node.attributes.map((child) => visit(child)),
					children: node.fragment.nodes.map((child) => visit(child))
				};
			},
			SlotElement(node, { visit }) {
				return {
					type: 'Slot',
					start: node.start,
					end: node.end,
					name: node.name,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			Attribute(node, { visit, next, path }) {
				if (node.value !== true && !Array.isArray(node.value)) {
					path.push(node);
					const value = /** @type {Legacy.LegacyAttribute['value']} */ ([visit(node.value)]);
					path.pop();

					return {
						...node,
						value
					};
				} else {
					return next();
				}
			},
			StyleDirective(node, { visit, next, path }) {
				if (node.value !== true && !Array.isArray(node.value)) {
					path.push(node);
					const value = /** @type {Legacy.LegacyStyleDirective['value']} */ ([visit(node.value)]);
					path.pop();

					return {
						...node,
						value
					};
				} else {
					return next();
				}
			},
			SpreadAttribute(node) {
				return { ...node, type: 'Spread' };
			},
			StyleSheet(node, context) {
				return {
					...node,
					...context.next(),
					type: 'Style'
				};
			},
			SvelteBody(node, { visit }) {
				return {
					type: 'Body',
					name: 'svelte:body',
					start: node.start,
					end: node.end,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			SvelteComponent(node, { visit }) {
				return {
					type: 'InlineComponent',
					name: 'svelte:component',
					start: node.start,
					end: node.end,
					expression: node.expression,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			SvelteDocument(node, { visit }) {
				return {
					type: 'Document',
					name: 'svelte:document',
					start: node.start,
					end: node.end,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			SvelteElement(node, { visit }) {
				/** @type {Expression | string} */
				let tag = node.tag;
				if (
					tag.type === 'Literal' &&
					typeof tag.value === 'string' &&
					source[/** @type {number} */ (node.tag.start) - 1] !== '{'
				) {
					tag = tag.value;
				}

				return {
					type: 'Element',
					name: 'svelte:element',
					start: node.start,
					end: node.end,
					tag,
					attributes: node.attributes.map((child) => visit(child)),
					children: node.fragment.nodes.map((child) => visit(child))
				};
			},
			SvelteFragment(node, { visit }) {
				return {
					type: 'SlotTemplate',
					name: 'svelte:fragment',
					start: node.start,
					end: node.end,
					attributes: node.attributes.map(
						(a) => /** @type {Legacy.LegacyAttributeLike} */ (visit(a))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			SvelteHead(node, { visit }) {
				return {
					type: 'Head',
					name: 'svelte:head',
					start: node.start,
					end: node.end,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			SvelteOptions(node, { visit }) {
				return {
					type: 'Options',
					name: 'svelte:options',
					start: node.start,
					end: node.end,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					)
				};
			},
			SvelteSelf(node, { visit }) {
				return {
					type: 'InlineComponent',
					name: 'svelte:self',
					start: node.start,
					end: node.end,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			SvelteWindow(node, { visit }) {
				return {
					type: 'Window',
					name: 'svelte:window',
					start: node.start,
					end: node.end,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			Text(node, { path }) {
				const parent = path.at(-1);
				if (parent?.type === 'RegularElement' && parent.name === 'style') {
					// these text nodes are missing `raw` for some dumb reason
					return /** @type {AST.Text} */ ({
						type: 'Text',
						start: node.start,
						end: node.end,
						data: node.data
					});
				}
			},
			TitleElement(node, { visit }) {
				return {
					type: 'Title',
					name: 'title',
					start: node.start,
					end: node.end,
					attributes: node.attributes.map(
						(child) => /** @type {Legacy.LegacyAttributeLike} */ (visit(child))
					),
					children: node.fragment.nodes.map(
						(child) => /** @type {Legacy.LegacyElementLike} */ (visit(child))
					)
				};
			},
			TransitionDirective(node) {
				return { ...node, type: 'Transition' };
			},
			UseDirective(node) {
				return { ...node, type: 'Action' };
			},
			LetDirective(node) {
				return { ...node, type: 'Let' };
			}
		})
	);
}

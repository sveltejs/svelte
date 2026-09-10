/** @import { AST } from '#compiler' */
/** @import { Expression, Identifier, Node, Pattern, Program } from 'estree' */
/** @import { Parsed, Scope } from '@teasel/parser' */
import { Source, parentOf, scopeOf } from '@teasel/parser';
import * as e from '../../errors.js';
import * as w from '../../warnings.js';
import * as state from '../../state.js';
import { ExpressionMetadata, disallow_children } from '../nodes.js';
import { keep_tables } from '../../utils/ast.js';
import { grammar } from './grammar.js';
import { dedent, unsupported } from './js.js';
import read_options from './options.js';
import { is_whitespace } from './utils/whitespace.js';
import { list } from '../../utils/string.js';

const VOID =
	'area base br col command embed hr img input keygen link meta param source track wbr'.split(' ');
const SCRIPT_RESERVED = ['server', 'client', 'worker', 'test', 'default'];
const SCRIPT_ALLOWED = ['context', 'generics', 'lang', 'module'];

/** The nodes of the template language; the JavaScript under them the parser read on its own. */
const TEMPLATE_TYPES = new Set([
	'Root',
	'Fragment',
	'Text',
	'Comment',
	'Script',
	'StyleSheet',
	'RegularElement',
	'SvelteElement',
	'SvelteComponent',
	'SvelteSelf',
	'SvelteWindow',
	'SvelteDocument',
	'SvelteBody',
	'SvelteHead',
	'SvelteOptions',
	'SvelteFragment',
	'SvelteBoundary',
	'TitleElement',
	'SlotElement',
	'Component',
	'Attribute',
	'SpreadAttribute',
	'AttachTag',
	'BindDirective',
	'ClassDirective',
	'StyleDirective',
	'OnDirective',
	'UseDirective',
	'TransitionDirective',
	'AnimateDirective',
	'LetDirective',
	'IfBlock',
	'EachBlock',
	'AwaitBlock',
	'KeyBlock',
	'SnippetBlock',
	'HtmlTag',
	'DebugTag',
	'ConstTag',
	'RenderTag',
	'ExpressionTag',
	'DeclarationTag'
]);

/** @param {{ type: string }} node */
export function is_template_node(node) {
	return TEMPLATE_TYPES.has(node.type);
}

const META_TAGS = [
	'svelte:head',
	'svelte:options',
	'svelte:window',
	'svelte:document',
	'svelte:body',
	'svelte:element',
	'svelte:component',
	'svelte:self',
	'svelte:fragment',
	'svelte:boundary'
];

const regex_lang_attribute =
	/<!--[^]*?-->|<script\s+(?:[^>]*|(?:[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s]+)\s+)*)lang=(["'])?([^"' >]+)\1[^>]*>/g;

export const regex_valid_component_name =
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers adjusted for our needs
	// (must start with uppercase letter if no dots, can contain dots)
	/^(?:\p{Lu}[$‌‍\p{ID_Continue}.]*|\p{ID_Start}[$‌‍\p{ID_Continue}]*(?:\.[$‌‍\p{ID_Continue}]+)+)$/u;

/**
 * @param {string} template
 * @param {boolean} [loose] keep reading past what cannot be read, for editors
 * @param {boolean} [erase] hand back JavaScript for TypeScript input, as the compiler wants it
 * @returns {AST.Root}
 */
export function parse(template, loose = false, erase = false) {
	if (typeof template !== 'string') {
		throw new TypeError('Template must be a string');
	}

	state.set_source(template);
	const trimmed = template.trimEnd();

	let match_lang;
	do match_lang = regex_lang_attribute.exec(trimmed);
	while (match_lang && match_lang[0][1] !== 's'); // ensure it starts with '<s' to match script tags
	regex_lang_attribute.lastIndex = 0;
	const ts = match_lang?.[2] === 'ts';

	/** @type {Parsed<AST.Root>} */
	let answer;
	try {
		answer = /** @type {any} */ (
			new Source(trimmed, {
				host: grammar,
				sourceType: 'module',
				typescript: ts && (erase ? 'erase' : true),
				comments: true,
				locations: true,
				scopes: true,
				errorRecovery: loose,
				parenthesized: true,
				// a script may export what the component declares elsewhere
				allowUndeclaredExports: true
			})
		).parse();
	} catch (error) {
		if (!(error instanceof SyntaxError)) throw error;
		throw_error(/** @type {any} */ (error), trimmed);
	}
	unsupported(answer.typescript);

	const root = answer.node;
	delete (/** @type {any} */ (root).loc);
	root.start = 0;
	root.end = template.length;
	root.metadata = { ts };

	/** @type {(Node | Node[])[]} the JavaScript of the template, each piece with its own tables */
	const roots = [];
	const finish = new Finish(trimmed, roots);
	finish.root(root);
	tables(answer, roots);

	// a comment between attributes is kept whole, one in JavaScript loses its line's indentation
	const spans = roots.map((root) => {
		const [first, last] = Array.isArray(root) ? [root[0], root[root.length - 1]] : [root, root];
		return [/** @type {number} */ (first?.start), /** @type {number} */ (last?.end)];
	});
	for (const comment of root.comments) {
		if (spans.some(([start, end]) => comment.start >= start && comment.end <= end))
			dedent(comment, trimmed);
	}

	return root;
}

/**
 * Brings the parser's tree to the compiler's shape: the metadata each node carries, the
 * location of each name, the options read out of `<svelte:options>`.
 */
class Finish {
	/**
	 * @param {string} template
	 * @param {(Node | Node[])[]} roots
	 */
	constructor(template, roots) {
		this.template = template;
		this.roots = roots;
	}

	/** @param {AST.Root} root */
	root(root) {
		if (root.module) this.script(root.module, root);
		if (root.instance) this.script(root.instance, root);
		if (root.css) this.css(root.css, root);
		this.fragment(root.fragment, false);

		const index = root.fragment.nodes.findIndex((node) => node.type === 'SvelteOptions');
		if (index !== -1) {
			const [options] = /** @type {AST.SvelteOptionsRaw[]} */ (
				root.fragment.nodes.splice(index, 1)
			);
			root.options = read_options(options);
			disallow_children(options);
			// We need this for the old AST format
			Object.defineProperty(root.options, '__raw__', { value: options, enumerable: false });
		}
	}

	/**
	 * @param {AST.Script} script
	 * @param {AST.Root} root
	 */
	script(script, root) {
		delete (/** @type {any} */ (script).loc);
		this.attributes(script.attributes);
		for (const attribute of /** @type {AST.Attribute[]} */ (script.attributes)) {
			if (SCRIPT_RESERVED.includes(attribute.name))
				e.script_reserved_attribute(attribute, attribute.name);
			if (!SCRIPT_ALLOWED.includes(attribute.name)) w.script_unknown_attribute(attribute);
		}
		this.js(script.content);
		const { loc } = script.content;
		if (loc) {
			// the legacy AST places the program at the tag, not at its contents
			({ line: loc.start.line, column: loc.start.column } = state.locator(script.start));
			({ line: loc.end.line, column: loc.end.column } = state.locator(script.end));
		}
		const comment = comment_before(root.fragment.nodes, script.start);
		if (comment) {
			// We take advantage of the fact that the root will never have leadingComments set,
			// and set the previous comment to it so that the warning mechanism can later
			// inspect the root and see if there was a html comment before it silencing specific warnings.
			script.content.leadingComments = [{ type: 'Line', value: comment.data }];
		}
	}

	/**
	 * @param {AST.CSS.StyleSheet} css
	 * @param {AST.Root} root
	 */
	css(css, root) {
		delete (/** @type {any} */ (css).loc);
		this.attributes(css.attributes);
		css.content.comment = comment_before(root.fragment.nodes, css.start);
		const walk = (/** @type {any} */ node) => {
			if (Array.isArray(node)) return node.forEach(walk);
			if (!node || typeof node !== 'object') return;
			delete node.loc;
			switch (node.type) {
				case 'Rule':
					node.metadata = {
						parent_rule: null,
						has_local_selectors: false,
						has_global_selectors: false,
						is_global_block: false
					};
					break;
				case 'ComplexSelector':
					node.metadata = { rule: null, is_global: false, used: false };
					break;
				case 'RelativeSelector':
					node.metadata = { is_global: false, is_global_like: false, scoped: false };
					break;
			}
			for (const key in node) if (key !== 'metadata') walk(node[key]);
		};
		walk(css.children);
		walk(css.comments);
		delete (/** @type {any} */ (css.content).loc);
	}

	/**
	 * @param {AST.Fragment} fragment
	 * @param {boolean} transparent
	 */
	fragment(fragment, transparent) {
		delete (/** @type {any} */ (fragment).loc);
		fragment.metadata = { transparent, dynamic: false };
		for (const node of fragment.nodes) this.node(node);
		if (transparent && fragment.nodes.some((node) => node.type === 'DeclarationTag')) {
			fragment.metadata.transparent = false;
		}
	}

	/** @param {AST.Fragment | null | undefined} fragment */
	body(fragment) {
		if (fragment) this.fragment(fragment, false);
	}

	/** @param {AST.TemplateNode} node */
	node(node) {
		// the parser locates every node; the AST locates the JavaScript ones
		delete (/** @type {any} */ (node).loc);
		switch (node.type) {
			case 'Text':
			case 'Comment':
				return;
			case 'RegularElement':
			case 'SvelteElement':
			case 'SvelteComponent':
			case 'SvelteSelf':
			case 'SvelteWindow':
			case 'SvelteDocument':
			case 'SvelteBody':
			case 'SvelteHead':
			case 'SvelteOptions':
			case 'SvelteFragment':
			case 'SvelteBoundary':
			case 'TitleElement':
			case 'SlotElement':
			case 'Component': {
				node.name_loc = loc(node.start + 1, node.start + 1 + node.name.length);
				/** @type {any} */ (node).metadata =
					node.type === 'RegularElement'
						? {
								svg: false,
								mathml: false,
								scoped: false,
								has_spread: false,
								path: [],
								synthetic_value_node: null
							}
						: /** @type {any} */ ({});
				if (node.type === 'SvelteElement') {
					// a tag named in text is the literal Svelte writes by hand, quoted its way
					if (node.tag.type === 'Literal' && node.tag.raw === node.tag.value)
						node.tag.raw = `'${node.tag.value}'`;
					else this.js(node.tag);
					node.metadata.expression = new ExpressionMetadata();
				}
				if (node.type === 'SvelteComponent') this.js(node.expression);
				if (node.type === 'SvelteComponent' || node.type === 'Component') {
					node.metadata.expression = new ExpressionMetadata();
				}
				this.attributes(node.attributes);
				this.fragment(node.fragment, true);
				if (node.type === 'RegularElement') this.implicitly_closed(node);
				return;
			}
			case 'ExpressionTag':
			case 'HtmlTag':
				this.expression(node, node.expression);
				return;
			case 'RenderTag':
				this.expression(node, node.expression);
				node.metadata = {
					...node.metadata,
					dynamic: false,
					arguments: [],
					path: [],
					snippets: new Set()
				};
				return;
			case 'ConstTag':
			case 'DeclarationTag':
				this.expression(node, node.declaration);
				return;
			case 'DebugTag':
				for (const identifier of node.identifiers) this.js(identifier);
				return;
			case 'IfBlock':
				this.expression(node, node.test);
				this.body(node.consequent);
				this.body(node.alternate);
				return;
			case 'EachBlock': {
				const index = /** @type {Identifier | string | undefined} */ (node.index);
				if (index !== undefined && typeof index !== 'string') node.index = index.name;
				node.metadata = /** @type {any} */ (null); // filled in later
				this.js(node.expression);
				if (node.context) this.js(node.context);
				if (node.key) this.js(node.key);
				this.body(node.body);
				this.body(node.fallback);
				return;
			}
			case 'AwaitBlock':
				this.expression(node, node.expression);
				if (node.value) this.js(node.value);
				if (node.error) this.js(node.error);
				this.body(node.pending);
				this.body(node.then);
				this.body(node.catch);
				return;
			case 'KeyBlock':
				this.expression(node, node.expression);
				this.body(node.fragment);
				return;
			case 'SnippetBlock':
				node.metadata = { can_hoist: false, sites: new Set() };
				this.js(node.parameters);
				this.body(node.body);
				return;
		}
	}

	/**
	 * @param {AST.ExpressionTag | AST.HtmlTag | AST.RenderTag | AST.ConstTag | AST.DeclarationTag | AST.IfBlock | AST.AwaitBlock | AST.KeyBlock | AST.SpreadAttribute | AST.AttachTag | AST.Directive} node
	 * @param {Node | null} expression
	 */
	expression(node, expression) {
		/** @type {any} */ (node).metadata = { expression: new ExpressionMetadata() };
		if (expression) this.js(expression);
	}

	/** @param {Array<AST.Attribute | AST.SpreadAttribute | AST.Directive | AST.AttachTag>} attributes */
	attributes(attributes) {
		for (const attribute of attributes) {
			delete (/** @type {any} */ (attribute).loc);
			switch (attribute.type) {
				case 'Attribute':
					attribute.metadata = { delegated: false, needs_clsx: false };
					attribute.name_loc = this.name_loc(attribute);
					this.value(attribute.value);
					break;
				case 'SpreadAttribute':
				case 'AttachTag':
					this.expression(attribute, attribute.expression);
					break;
				case 'StyleDirective':
					this.expression(attribute, null);
					attribute.name_loc = this.name_loc(attribute);
					this.value(attribute.value);
					break;
				case 'LetDirective': {
					this.expression(attribute, null);
					attribute.name_loc = this.name_loc(attribute);
					const expression = /** @type {Pattern | null} */ (attribute.expression);
					if (
						expression?.type === 'Identifier' &&
						expression.name === attribute.name &&
						expression.start === attribute.start + 4
					) {
						attribute.expression = null;
					} else if (expression) {
						attribute.expression = /** @type {any} */ (to_expression(expression));
						this.js(/** @type {Node} */ (attribute.expression));
					}
					break;
				}
				default:
					this.expression(attribute, attribute.expression);
					attribute.name_loc = this.name_loc(attribute);
			}
		}
	}

	/** @param {true | AST.ExpressionTag | Array<AST.Text | AST.ExpressionTag>} value */
	value(value) {
		if (value === true) return;
		for (const chunk of Array.isArray(value) ? value : [value]) {
			delete (/** @type {any} */ (chunk).loc);
			if (chunk.type === 'ExpressionTag') this.expression(chunk, chunk.expression);
		}
	}

	/**
	 * The location of an attribute's name as the tag was read: up to whitespace, a slash, a
	 * quote or `=`; a shorthand's is its identifier's.
	 * @param {AST.Attribute | AST.Directive} attribute
	 */
	name_loc(attribute) {
		const { template } = this;
		const start = attribute.start;
		const value = /** @type {AST.Attribute} */ (attribute).value;
		if (template[start] === '{' && value !== true && !Array.isArray(value)) {
			const { expression } = value;
			return loc(/** @type {number} */ (expression.start), /** @type {number} */ (expression.end));
		}
		let end = start;
		while (end < template.length) {
			const code = template.charCodeAt(end);
			if (
				is_whitespace(code) ||
				code === 47 ||
				code === 62 ||
				code === 34 ||
				code === 39 ||
				code === 61
			)
				break;
			end += 1;
		}
		return loc(start, end);
	}

	/**
	 * An element the browser closed, at the tag that closed it: the parent's closing tag, or a
	 * sibling that cannot sit inside it.
	 * @param {AST.RegularElement} node
	 */
	implicitly_closed(node) {
		const { template } = this;
		const { name, end } = node;
		if (VOID.includes(name) || template.startsWith('/>', end - 2)) return;
		const closing = template.lastIndexOf('</', end - 1);
		if (
			closing !== -1 &&
			template.startsWith(name, closing + 2) &&
			/^\s*>$/.test(template.slice(closing + 2 + name.length, end))
		) {
			return;
		}
		const closer = /^<(\/?)([^\s/>]+)/.exec(template.slice(end, end + 200));
		if (!closer) return;
		w.element_implicitly_closed(
			{ start: node.start, end: node.fragment.nodes[0]?.start ?? end },
			`<${closer[1]}${closer[2]}>`,
			`</${name}>`
		);
	}

	/** @param {Node | Node[]} node a piece of JavaScript the parser read on its own */
	js(node) {
		this.roots.push(node);
	}
}

/**
 * The parser's tables cut to each piece of JavaScript, as the scope analysis reads them piece by
 * piece: the scopes opened inside it, the bindings declared and the references made there, and
 * first the scope around it.
 * @param {Parsed<AST.Root>} answer
 * @param {(Node | Node[])[]} roots
 */
function tables(answer, roots) {
	const scopes = /** @type {Scope[]} */ (answer.scopes);
	const bindings = /** @type {import('@teasel/parser').Binding[]} */ (answer.bindings);
	const references = /** @type {import('@teasel/parser').Reference[]} */ (answer.references);
	/** @type {Scope} */
	const nowhere = { kind: 'fragment', node: null, parent: null, topLevelAwait: false };
	// each table in source order, so a root's entries are one run of it; a fragment has no span
	// and holds JavaScript rather than sitting in it
	const opening = scopes
		.filter((scope) => typeof (/** @type {any} */ (scope.node)?.start) === 'number')
		.sort((a, b) => /** @type {any} */ (a.node).start - /** @type {any} */ (b.node).start);
	const named = scopes.filter((scope) => scope.node === null);
	const declaring = bindings
		.filter((binding) => binding.node !== null)
		.sort((a, b) => /** @type {any} */ (a.node).start - /** @type {any} */ (b.node).start);
	const nameless = bindings.filter((binding) => binding.node === null);
	const referring = [...references].sort(
		(a, b) => /** @type {number} */ (a.node.start) - /** @type {number} */ (b.node.start)
	);
	/**
	 * The entries of a sorted table inside a span.
	 * @template T
	 * @param {T[]} table
	 * @param {(entry: T) => any} node
	 * @param {number} start
	 * @param {number} end
	 */
	const within = (table, node, start, end) => {
		let low = 0;
		let high = table.length;
		while (low < high) {
			const mid = (low + high) >> 1;
			if (node(table[mid]).start < start) low = mid + 1;
			else high = mid;
		}
		/** @type {T[]} */
		const found = [];
		for (let i = low; i < table.length && node(table[i]).start < end; i += 1) {
			if (node(table[i]).end <= end) found.push(table[i]);
		}
		return found;
	};
	for (const root of roots) {
		const list = Array.isArray(root) ? root : [root];
		if (list.length === 0) continue;
		const start = /** @type {number} */ (list[0].start);
		const end = /** @type {number} */ (list[list.length - 1].end);
		// a script's program is the scope itself; any other piece sits in the scope around it
		const own =
			/** @type {any} */ (root).type === 'Program'
				? scopes.find((scope) => scope.node === root)
				: undefined;
		const inside = within(opening, (scope) => scope.node, start, end).filter(
			(scope) => scope !== own
		);
		// a function-name scope has no node of its own; it sits between a scope and the function it names
		const parents = new Set(inside.map((scope) => scope.parent));
		const opened =
			named.length === 0
				? inside
				: scopes.filter(
						(scope) =>
							scope !== own && (scope.node === null ? parents.has(scope) : inside.includes(scope))
					);
		const declared = within(declaring, (binding) => binding.node, start, end);
		if (nameless.length > 0) {
			for (const binding of nameless) if (opened.includes(binding.scope)) declared.push(binding);
		}
		const made = within(referring, (reference) => reference.node, start, end);
		const outermost =
			own ??
			[...opened.map((scope) => scope.parent), ...declared, ...made]
				.map((entry) => (entry && 'scope' in entry ? entry.scope : entry))
				.find((scope) => scope !== null && !opened.includes(/** @type {Scope} */ (scope))) ??
			around(list[0]) ??
			nowhere;
		keep_tables(root, {
			node: root,
			end,
			scopes: [outermost, ...opened],
			bindings: declared,
			references: made
		});
	}
}

/**
 * The scope a piece of JavaScript sits in when nothing in it says: the nearest ancestor that opens one.
 * @param {Node} node
 */
function around(node) {
	for (let parent = parentOf(node); parent !== undefined; parent = parentOf(parent)) {
		const scope = scopeOf(parent);
		if (scope !== undefined) return scope;
	}
	return undefined;
}

/**
 * The comment right before a script or style element, whitespace apart.
 * @param {AST.TemplateNode[]} nodes
 * @param {number} start
 */
function comment_before(nodes, start) {
	let i = nodes.findIndex((node) => /** @type {number} */ (node.start) >= start);
	if (i === -1) i = nodes.length;
	if (i === 0 || nodes[i - 1].end !== start) return null;
	for (i -= 1; i >= 0; i -= 1) {
		const node = nodes[i];
		if (node.type === 'Comment') return node;
		if (node.type !== 'Text' || node.data.trim()) break;
	}
	return null;
}

/**
 * @param {number} start
 * @param {number} end
 */
function loc(start, end) {
	return { start: state.locator(start), end: state.locator(end) };
}

/**
 * The parser reads a `let:` directive's value as a pattern; the AST holds it as the expression it looks like.
 * @param {Pattern} node
 * @returns {Expression}
 */
function to_expression(node) {
	switch (node.type) {
		case 'ObjectPattern':
			return {
				...node,
				type: 'ObjectExpression',
				properties: node.properties.map((property) =>
					property.type === 'Property'
						? { ...property, value: to_expression(property.value) }
						: /** @type {any} */ ({
								...property,
								type: 'SpreadElement',
								argument: to_expression(property.argument)
							})
				)
			};
		case 'ArrayPattern':
			return {
				...node,
				type: 'ArrayExpression',
				elements: node.elements.map((element) => element && to_expression(element))
			};
		case 'AssignmentPattern':
			return {
				.../** @type {any} */ (node),
				type: 'AssignmentExpression',
				operator: '=',
				left: to_expression(node.left),
				right: node.right
			};
		case 'RestElement':
			return /** @type {any} */ ({
				...node,
				type: 'SpreadElement',
				argument: to_expression(node.argument)
			});
		default:
			return /** @type {Expression} */ (node);
	}
}

/**
 * The parser's error as the compiler's: what it expected or found, at the same place.
 * @param {{ code: string, message: string, pos: number, end: number }} error
 * @param {string} template
 * @returns {never}
 */
function throw_error(error, template) {
	const { code, message, pos, end } = error;
	const range = { start: pos, end };
	switch (code) {
		case 'unexpected_eof':
			e.unexpected_eof(pos);
		// eslint-disable-next-line no-fallthrough
		case 'expected': {
			const what = message.slice('Expected '.length);
			if (what === 'whitespace') e.expected_whitespace(pos);
			if (what === 'an identifier') {
				let brace = pos;
				while (brace > 0 && is_whitespace(template.charCodeAt(brace - 1))) brace -= 1;
				if (template[brace - 1] === '{' && template[pos] === '}')
					e.attribute_empty_shorthand(brace - 1);
				e.expected_identifier(pos);
			}
			if (what === 'a directive name') {
				const colon = template.indexOf(':', pos);
				e.directive_missing_name({ start: pos, end: colon + 1 }, template.slice(pos, colon + 1));
			}
			if (what === 'a single declaration') e.const_tag_invalid_expression(range);
			if (what === '}' && template.lastIndexOf('{@debug', pos) > template.lastIndexOf('}', pos)) {
				e.debug_tag_invalid_arguments(template.lastIndexOf('{@debug', pos) + '{@debug '.length);
			}
			// a branch that fits no open block, reported at its sigil
			if (what === 'else') e.expected_token(pos + 1, '{:else}');
			if (what === 'else if or else') e.expected_token(pos + 1, '{:else} or {:else if}');
			if (what === 'then or catch') e.expected_token(pos + 1, '{:then ...} or {:catch ...}');
			if (what === 'a block name') e.expected_block_type(pos);
			if (what === 'an attribute value') e.expected_attribute_value(pos);
			if (what === 'a tag name') e.expected_tag(pos);
			if (what === 'a this attribute') {
				if (template.startsWith('<svelte:element', pos)) e.svelte_element_missing_this(pos);
				e.svelte_component_missing_this(pos);
			}
			if (what === 'an expression as this') {
				if (
					template.lastIndexOf('<svelte:element', pos) >
					template.lastIndexOf('<svelte:component', pos)
				) {
					e.svelte_element_missing_this(range);
				}
				e.svelte_component_invalid_this(range);
			}
			if (what === 'an expression, not text' || what === 'a value') e.directive_invalid_value(pos);
			if (what.startsWith('context to be')) e.script_invalid_context(range);
			if (what === 'module without a value') e.script_invalid_attribute_value(range, 'module');
			if (what === 'a valid CSS identifier') e.css_expected_identifier(pos);
			if (what === 'a selector') e.css_selector_invalid(range);
			if (what === 'a declaration value') e.css_empty_declaration(range);
			e.expected_token(pos, what);
		}
		// eslint-disable-next-line no-fallthrough
		case 'unclosed': {
			const name = message.slice(0, -' is not closed'.length);
			// a script or style open at the end: what was left open, or nothing at all past the tag
			if (pos === template.length && /<(script|style)[^>]*>$/.test(template)) e.unexpected_eof(pos);
			if (template[pos] === '{') e.block_unclosed(range);
			e.element_unclosed(range, name);
		}
		// eslint-disable-next-line no-fallthrough
		case 'unexpected_close': {
			const [name, reason] = message.slice('Unexpected closing '.length).split(', closed by ');
			if (template[pos] === '{') e.block_unexpected_close(pos + 1);
			if (reason) e.element_invalid_closing_tag_autoclosed(pos, name, reason);
			e.element_invalid_closing_tag(pos, name);
		}
		// eslint-disable-next-line no-fallthrough
		case 'duplicate': {
			const name = message.slice('Duplicate '.length);
			if (name === 'script') e.script_duplicate(pos);
			if (name === 'style') e.style_duplicate(pos);
			if (name.startsWith('svelte:')) e.svelte_meta_duplicate(pos, name);
			e.attribute_duplicate(range);
		}
		// eslint-disable-next-line no-fallthrough
		case 'placement': {
			const what = message.slice(0, -' is not allowed here'.length);
			if (what === 'A closing tag of a void element') e.void_element_invalid_content(pos);
			if (what === 'A declaration of that kind') e.declaration_tag_invalid_type(range);
			if (what === 'A branch outside its block') e.block_invalid_continuation_placement(pos + 1);
			const misplaced = /^A block or tag in (.+)$/.exec(what);
			if (misplaced) {
				const location =
					misplaced[1] === 'an attribute value' ? 'in attribute value' : `inside ${misplaced[1]}`;
				const [, sigil, name] = /** @type {RegExpExecArray} */ (
					/^\{([#@])(\w+)/.exec(template.slice(pos))
				);
				if (sigil === '#') e.block_invalid_placement(pos, name, location);
				e.tag_invalid_placement(pos, name, location);
			}
			if (what.startsWith('svelte:')) e.svelte_meta_invalid_placement(pos, what);
			e.js_parse_error(range, message);
		}
		// eslint-disable-next-line no-fallthrough
		case 'redeclaration':
			e.declaration_duplicate(
				range,
				message.slice("Identifier '".length, -"' has already been declared".length)
			);
		// eslint-disable-next-line no-fallthrough
		case 'invalid_name':
			if (template.startsWith('svelte:', pos)) e.svelte_meta_invalid_tag(range, list(META_TAGS));
			e.tag_invalid_name(range);
		// eslint-disable-next-line no-fallthrough
		case 'reserved_word':
			e.unexpected_reserved_word(
				pos,
				message.slice("The keyword '".length, -"' is reserved".length)
			);
		// eslint-disable-next-line no-fallthrough
		default: {
			// a keyword where the template wanted a name of its own, an each block's context say
			const keyword = /^Unexpected keyword '(\w+)'$/.exec(message);
			if (keyword && /(\bas|\bthen|\bcatch|,)\s*$/.test(template.slice(0, pos))) {
				e.unexpected_reserved_word(pos, keyword[1]);
			}
			e.js_parse_error(range, message);
		}
	}
}

/**
 * The cursor the stylesheet reader moves over a stylesheet parsed on its own.
 */
export class Parser {
	template = '';

	index = 0;

	/** @type {AST.CSS.CSSComment[]} */
	css_comments = [];

	/** @param {string} source */
	static forCss(source) {
		const parser = new Parser();
		parser.template = source;
		return parser;
	}

	/**
	 * @param {string} str
	 * @param {boolean} required
	 */
	eat(str, required = false) {
		if (this.match(str)) {
			this.index += str.length;
			return true;
		}

		if (required) {
			e.expected_token(this.index, str);
		}

		return false;
	}

	/** @param {string} str */
	match(str) {
		const length = str.length;
		if (length === 1) {
			// more performant than slicing
			return this.template[this.index] === str;
		}

		return this.template.startsWith(str, this.index);
	}

	/**
	 * Match a regex at the current index
	 * @param {RegExp} pattern  Should have the sticky (`y`) flag so that it only matches at the current index
	 */
	match_regex(pattern) {
		pattern.lastIndex = this.index;
		const match = pattern.exec(this.template);
		if (!match || match.index !== this.index) return null;

		return match[0];
	}

	allow_whitespace() {
		while (
			this.index < this.template.length &&
			is_whitespace(this.template.charCodeAt(this.index))
		) {
			this.index++;
		}
	}

	/**
	 * Search for a regex starting at the current index and return the result if it matches
	 * @param {RegExp} pattern  Should have a ^ anchor at the start so the regex doesn't search past the beginning, resulting in worse performance
	 */
	read(pattern) {
		const result = this.match_regex(pattern);
		if (result) this.index += result.length;
		return result;
	}

	/** @param {string} delimiter */
	read_until(delimiter) {
		if (this.index >= this.template.length) {
			e.unexpected_eof(this.template.length);
		}

		const start = this.index;
		const index = this.template.indexOf(delimiter, start);

		if (index !== -1) {
			this.index = index;
			return this.template.slice(start, this.index);
		}

		this.index = this.template.length;
		return this.template.slice(start);
	}

	/** @param {RegExp} pattern */
	read_until_regex(pattern) {
		if (this.index >= this.template.length) {
			e.unexpected_eof(this.template.length);
		}

		const start = this.index;
		const match = pattern.exec(this.template.slice(start));

		if (match) {
			this.index = start + match.index;
			return this.template.slice(start, this.index);
		}

		this.index = this.template.length;
		return this.template.slice(start);
	}
}

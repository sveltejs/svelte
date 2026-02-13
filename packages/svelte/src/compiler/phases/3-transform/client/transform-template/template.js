/** @import { AST } from '#compiler' */
/** @import { Node, Element } from './types'; */
import { escape_html } from '../../../../../escaping.js';
import { is_void } from '../../../../../utils.js';
import * as b from '#compiler/builders';
import fix_attribute_casing from './fix-attribute-casing.js';
import { regex_starts_with_newline } from '../../../patterns.js';

export class Template {
	/**
	 * `true` if HTML template contains a `<script>` tag. In this case we need to invoke a special
	 * template instantiation function (see `create_fragment_with_script_from_html` for more info)
	 */
	contains_script_tag = false;

	/** `true` if the HTML template needs to be instantiated with `importNode` */
	needs_import_node = false;

	/** @type {Node[]} */
	nodes = [];

	/** @type {Node[][]} */
	#stack = [this.nodes];

	/** @type {Element | undefined} */
	#element;

	#fragment = this.nodes;

	/**
	 * @param {string} name
	 * @param {number} start
	 * @param {boolean} is_html
	 */
	push_element(name, start, is_html) {
		this.#element = {
			type: 'element',
			name,
			attributes: {},
			children: [],
			is_html,
			start
		};

		this.#fragment.push(this.#element);

		this.#fragment = /** @type {Element} */ (this.#element).children;
		this.#stack.push(this.#fragment);
	}

	/** @param {string} [data] */
	push_comment(data) {
		this.#fragment.push({ type: 'comment', data });
	}

	/** @param {AST.Text[]} nodes */
	push_text(nodes) {
		this.#fragment.push({ type: 'text', nodes });
	}

	pop_element() {
		this.#stack.pop();
		this.#fragment = /** @type {Node[]} */ (this.#stack.at(-1));
	}

	/**
	 * @param {string} key
	 * @param {string | undefined} value
	 */
	set_prop(key, value) {
		/** @type {Element} */ (this.#element).attributes[key] = value;
	}

	as_html() {
		return b.template([b.quasi(this.nodes.map(stringify).join(''), true)], []);
	}

	as_tree() {
		// if the first item is a comment we need to add another comment for effect.start
		if (this.nodes[0].type === 'comment') {
			this.nodes.unshift({ type: 'comment', data: undefined });
		}

		return b.array(this.nodes.map(objectify));
	}
}

/**
 * @param {Node} item
 */
function stringify(item) {
	if (item.type === 'text') {
		return item.nodes.map((node) => node.raw).join('');
	}

	if (item.type === 'comment') {
		return item.data ? `<!--${item.data}-->` : '<!>';
	}

	let str = `<${item.name}`;

	for (const key in item.attributes) {
		const value = item.attributes[key];

		str += ` ${item.is_html ? key.toLowerCase() : key}`;
		if (value !== undefined) str += `="${escape_html(value, true)}"`;
	}

	if (is_void(item.name)) {
		str += '/>'; // XHTML compliance
	} else {
		str += `>`;
		str += item.children.map(stringify).join('');
		str += `</${item.name}>`;
	}

	return str;
}

/** @param {Node} item */
function objectify(item) {
	if (item.type === 'text') {
		return b.literal(item.nodes.map((node) => node.data).join(''));
	}

	if (item.type === 'comment') {
		return item.data ? b.array([b.literal(`// ${item.data}`)]) : null;
	}

	const element = b.array([b.literal(item.name)]);

	const attributes = b.object([]);

	for (const key in item.attributes) {
		const value = item.attributes[key];

		attributes.properties.push(
			b.prop(
				'init',
				b.key(fix_attribute_casing(key)),
				value === undefined ? b.void0 : b.literal(value)
			)
		);
	}

	if (attributes.properties.length > 0 || item.children.length > 0) {
		element.elements.push(attributes.properties.length > 0 ? attributes : b.null);
	}

	if (item.children.length > 0) {
		const children = item.children.map(objectify);
		element.elements.push(...children);

		// special case — strip leading newline from `<pre>` and `<textarea>`
		if (item.name === 'pre' || item.name === 'textarea') {
			const first = children[0];
			if (first?.type === 'Literal') {
				first.value = /** @type {string} */ (first.value).replace(regex_starts_with_newline, '');
			}
		}
	}

	return element;
}

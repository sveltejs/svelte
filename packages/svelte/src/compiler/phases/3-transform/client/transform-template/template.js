/** @import { AST } from '#compiler' */
/** @import { Node, Element } from './types'; */

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

	/** @param {string} name */
	create_element(name) {
		this.#element = {
			type: 'element',
			name,
			attributes: {},
			children: []
		};

		this.#fragment.push(this.#element);
	}

	/** @param {string} [data] */
	create_anchor(data) {
		this.#fragment.push({ type: 'anchor', data });
	}

	/** @param {AST.Text[]} nodes */
	create_text(nodes) {
		this.#fragment.push({ type: 'text', nodes });
	}

	push_element() {
		const element = /** @type {Element} */ (this.#element);
		this.#fragment = element.children;
		this.#stack.push(this.#fragment);
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
		const element = /** @type {Element} */ (this.#element);
		element.attributes[key] = value;
	}
}

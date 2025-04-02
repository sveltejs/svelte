const ELEMENT_NODE_TYPE = 1;
const TEXT_NODE_TYPE = 3;
const COMMENT_NODE_TYPE = 8;
const FRAGMENT_NODE_TYPE = 11;

export function createRenderer(opts) {
	class Node {
		tagName;
		data;
		parent;
		nodeType;
		nodeName;

		#element;
		#children = [];

		constructor(node_type, element, tag) {
			this.tagName = tag;
			this.nodeName = tag;
			this.#element = element;
			this.nodeType = node_type;
		}

		get element() {
			return this.#element;
		}

		get childNodes() {
			return this.#children;
		}

		get firstChild() {
			return this.#children[0];
		}

		get lastChild() {
			return this.#children[this.#children.lenght - 1];
		}

		get nextSibling() {
			if (this.parent) {
				const idx = this.parent.#children.findIndex((el) => el === this);
				return this.parent.#children[idx + 1] ?? null;
			}
			return null;
		}

		get className() {
			return this.getAttribute('class');
		}

		set className(className) {
			this.setAttribute('class', className);
		}

		setAttribute(key, value) {
			opts.setAttribute(this.#element, key, value);
		}

		getAttribute(key) {
			return opts.getAttribute(this.#element, key);
		}

		hasAttribute(key) {
			return !!this.getAttribute(key);
		}

		removeAttribute(key) {
			this.setAttribute(key, null);
		}

		addEventListener(name, handler, options) {
			if (this.nodeType === FRAGMENT_NODE_TYPE) return;
			opts.addEventListener(this.#element, name, handler, options);
		}

		remove() {
			if (this.parent) {
				this.parent.#children = this.parent.#children.filter((el) => el !== this);
			}
		}

		appendChild(child) {
			this.append(child);
			return child;
		}

		before(node) {
			if (this.parent) {
				const idx = this.parent.#children.findIndex((el) => el === this);
				const nodes = node.nodeType === FRAGMENT_NODE_TYPE ? node.childNodes : [node];
				this.parent.#children.splice(idx, 0, ...nodes);
				for (let node of nodes) {
					opts.insert(node.#element, this.parent.#element, this.#element);
					node.parent = this.parent;
				}
			}
		}

		append(...nodes) {
			for (let node of nodes) {
				node.parent = this;
				this.#children.push(node);
				if (this.nodeType !== FRAGMENT_NODE_TYPE) {
					opts.insert(node.#element, this.#element);
				}
			}
		}

		cloneNode() {
			const cloned = new Node(
				this.nodeType,
				this.#element != null ? opts.cloneNode(this.#element) : this.#element,
				this.tagName
			);
			for (let node of this.#children) {
				cloned.append(node.cloneNode());
			}
			return cloned;
		}
	}

	class Document {
		createElement(tag) {
			const element = opts.createElement(tag);
			return new Node(ELEMENT_NODE_TYPE, element, tag);
		}
		createDocumentFragment() {
			return new Node(FRAGMENT_NODE_TYPE);
		}
		createComment(data) {
			const comment = opts.createComment(data);
			return new Node(COMMENT_NODE_TYPE, comment, data);
		}
		createTextNode(data) {
			const element = opts.createTextNode(data);
			return new Node(TEXT_NODE_TYPE, element, data);
		}
	}

	return {
		Node,
		document: new Document()
	};
}

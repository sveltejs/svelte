import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import Selector from './Selector.js';
import hash from '../utils/hash.js';
import compiler_warnings from '../compiler_warnings.js';
import { extract_ignores_above_position } from '../../utils/extract_svelte_ignore.js';
import { push_array } from '../../utils/push_array.js';
import { regex_only_whitespaces, regex_whitespace } from '../../utils/patterns.js';

const regex_css_browser_prefix = /^-((webkit)|(moz)|(o)|(ms))-/;

/**
 * @param {string} name
 * @returns {string}
 */
function remove_css_prefix(name) {
	return name.replace(regex_css_browser_prefix, '');
}

/** @param {import('./private.js').CssNode} node */
const is_keyframes_node = (node) => remove_css_prefix(node.name) === 'keyframes';

/**
 * @param {import('./private.js').CssNode} param
 * @returns {true}
 */
const at_rule_has_declaration = ({ block }) =>
	block && block.children && block.children.find((node) => node.type === 'Declaration');

/**
 * @param {import('magic-string').default} code
 * @param {number} start
 * @param {Declaration[]} declarations
 * @returns {number}
 */
function minify_declarations(code, start, declarations) {
	let c = start;
	declarations.forEach((declaration, i) => {
		const separator = i > 0 ? ';' : '';
		if (declaration.node.start - c > separator.length) {
			code.update(c, declaration.node.start, separator);
		}
		declaration.minify(code);
		c = declaration.node.end;
	});
	return c;
}
class Rule {
	/** @type {import('./Selector.js').default[]} */
	selectors;

	/** @type {Declaration[]} */
	declarations;

	/** @type {import('./private.js').CssNode} */
	node;

	/** @type {Atrule} */
	parent;

	/**
	 * @param {import('./private.js').CssNode} node
	 * @param {any} stylesheet
	 * @param {Atrule} [parent]
	 */
	constructor(node, stylesheet, parent) {
		this.node = node;
		this.parent = parent;
		this.selectors = node.prelude.children.map((node) => new Selector(node, stylesheet));
		this.declarations = node.block.children.map((node) => new Declaration(node));
	}

	/** @param {import('../nodes/Element.js').default} node */
	apply(node) {
		this.selectors.forEach((selector) => selector.apply(node)); // TODO move the logic in here?
	}

	/** @param {boolean} dev */
	is_used(dev) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node))
			return true;
		if (this.declarations.length === 0) return dev;
		return this.selectors.some((s) => s.used);
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {boolean} _dev
	 */
	minify(code, _dev) {
		let c = this.node.start;
		let started = false;
		this.selectors.forEach((selector) => {
			if (selector.used) {
				const separator = started ? ',' : '';
				if (selector.node.start - c > separator.length) {
					code.update(c, selector.node.start, separator);
				}
				selector.minify(code);
				c = selector.node.end;
				started = true;
			}
		});
		code.remove(c, this.node.block.start);
		c = this.node.block.start + 1;
		c = minify_declarations(code, c, this.declarations);
		code.remove(c, this.node.block.end - 1);
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {string} id
	 * @param {Map<string, string>} keyframes
	 * @param {number} max_amount_class_specificity_increased
	 */
	transform(code, id, keyframes, max_amount_class_specificity_increased) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node))
			return true;
		const attr = `.${id}`;
		this.selectors.forEach((selector) =>
			selector.transform(code, attr, max_amount_class_specificity_increased)
		);
		this.declarations.forEach((declaration) => declaration.transform(code, keyframes));
	}

	/** @param {import('../Component.js').default} component */
	validate(component) {
		this.selectors.forEach((selector) => {
			selector.validate(component);
		});
	}

	/** @param {(selector: import('./Selector.js').default) => void} handler */
	warn_on_unused_selector(handler) {
		this.selectors.forEach((selector) => {
			if (!selector.used) handler(selector);
		});
	}
	get_max_amount_class_specificity_increased() {
		return Math.max(
			...this.selectors.map((selector) => selector.get_amount_class_specificity_increased())
		);
	}
}
class Declaration {
	/** @type {import('./private.js').CssNode} */
	node;

	/** @param {import('./private.js').CssNode} node */
	constructor(node) {
		this.node = node;
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {Map<string, string>} keyframes
	 */
	transform(code, keyframes) {
		const property = this.node.property && remove_css_prefix(this.node.property.toLowerCase());
		if (property === 'animation' || property === 'animation-name') {
			this.node.value.children.forEach((block) => {
				if (block.type === 'Identifier') {
					const name = block.name;
					if (keyframes.has(name)) {
						code.update(block.start, block.end, keyframes.get(name));
					}
				}
			});
		}
	}

	/** @param {import('magic-string').default} code */
	minify(code) {
		if (!this.node.property) return; // @apply, and possibly other weird cases?
		const c = this.node.start + this.node.property.length;
		const first = this.node.value.children ? this.node.value.children[0] : this.node.value;
		// Don't minify whitespace in custom properties, since some browsers (Chromium < 99)
		// treat --foo: ; and --foo:; differently
		if (first.type === 'Raw' && regex_only_whitespaces.test(first.value)) return;
		let start = first.start;
		while (regex_whitespace.test(code.original[start])) start += 1;
		if (start - c > 1) {
			code.update(c, start, ':');
		}
	}
}
class Atrule {
	/** @type {import('./private.js').CssNode} */
	node;

	/** @type {Array<Atrule | Rule>} */
	children;

	/** @type {Declaration[]} */
	declarations;

	/** @param {import('./private.js').CssNode} node */
	constructor(node) {
		this.node = node;
		this.children = [];
		this.declarations = [];
	}

	/** @param {import('../nodes/Element.js').default} node */
	apply(node) {
		if (
			this.node.name === 'container' ||
			this.node.name === 'media' ||
			this.node.name === 'supports' ||
			this.node.name === 'layer'
		) {
			this.children.forEach((child) => {
				child.apply(node);
			});
		} else if (is_keyframes_node(this.node)) {
			this.children.forEach((/** @type {Rule} */ rule) => {
				rule.selectors.forEach((selector) => {
					selector.used = true;
				});
			});
		}
	}

	/** @param {boolean} _dev */
	is_used(_dev) {
		return true; // TODO
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {boolean} dev
	 */
	minify(code, dev) {
		if (this.node.name === 'media') {
			const expression_char = code.original[this.node.prelude.start];
			let c = this.node.start + (expression_char === '(' ? 6 : 7);
			if (this.node.prelude.start > c) code.remove(c, this.node.prelude.start);
			this.node.prelude.children.forEach((query) => {
				// TODO minify queries
				c = query.end;
			});
			code.remove(c, this.node.block.start);
		} else if (this.node.name === 'supports') {
			let c = this.node.start + 9;
			if (this.node.prelude.start - c > 1) code.update(c, this.node.prelude.start, ' ');
			this.node.prelude.children.forEach((query) => {
				// TODO minify queries
				c = query.end;
			});
			code.remove(c, this.node.block.start);
		} else {
			let c = this.node.start + this.node.name.length + 1;
			if (this.node.prelude) {
				if (this.node.prelude.start - c > 1) code.update(c, this.node.prelude.start, ' ');
				c = this.node.prelude.end;
			}
			if (this.node.block && this.node.block.start - c > 0) {
				code.remove(c, this.node.block.start);
			}
		}
		// TODO other atrules
		if (this.node.block) {
			let c = this.node.block.start + 1;
			if (this.declarations.length) {
				c = minify_declarations(code, c, this.declarations);
				// if the atrule has children, leave the last declaration semicolon alone
				if (this.children.length) c++;
			}
			this.children.forEach((child) => {
				if (child.is_used(dev)) {
					code.remove(c, child.node.start);
					child.minify(code, dev);
					c = child.node.end;
				}
			});
			code.remove(c, this.node.block.end - 1);
		}
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {string} id
	 * @param {Map<string, string>} keyframes
	 * @param {number} max_amount_class_specificity_increased
	 */
	transform(code, id, keyframes, max_amount_class_specificity_increased) {
		if (is_keyframes_node(this.node)) {
			this.node.prelude.children.forEach(({ type, name, start, end }) => {
				if (type === 'Identifier') {
					if (name.startsWith('-global-')) {
						code.remove(start, start + 8);
						this.children.forEach((/** @type {Rule} */ rule) => {
							rule.selectors.forEach((selector) => {
								selector.used = true;
							});
						});
					} else {
						code.update(start, end, keyframes.get(name));
					}
				}
			});
		}
		this.children.forEach((child) => {
			child.transform(code, id, keyframes, max_amount_class_specificity_increased);
		});
	}

	/** @param {import('../Component.js').default} component */
	validate(component) {
		this.children.forEach((child) => {
			child.validate(component);
		});
	}

	/** @param {(selector: import('./Selector.js').default) => void} handler */
	warn_on_unused_selector(handler) {
		if (this.node.name !== 'media') return;
		this.children.forEach((child) => {
			child.warn_on_unused_selector(handler);
		});
	}
	get_max_amount_class_specificity_increased() {
		return Math.max(
			...this.children.map((rule) => rule.get_max_amount_class_specificity_increased())
		);
	}
}

/** @param {any} params */
const get_default_css_hash = ({ css, hash }) => {
	return `svelte-${hash(css)}`;
};
export default class Stylesheet {
	/** @type {string} */
	source;

	/** @type {import('../../interfaces.js').Ast} */
	ast;

	/** @type {string} */
	filename;

	/** @type {boolean} */
	dev;

	/** @type {boolean} */
	has_styles;

	/** @type {string} */
	id;

	/** @type {Array<Rule | Atrule>} */
	children = [];

	/** @type {Map<string, string>} */
	keyframes = new Map();

	/** @type {Set<import('./private.js').CssNode>} */
	nodes_with_css_class = new Set();

	/**
	 * @param {{
	 * 		source: string;
	 * 		ast: import('../../interfaces.js').Ast;
	 * 		filename: string | undefined;
	 * 		component_name: string | undefined;
	 * 		dev: boolean;
	 * 		get_css_hash: import('../../interfaces.js').CssHashGetter;
	 * 	}} params
	 */
	constructor({ source, ast, component_name, filename, dev, get_css_hash = get_default_css_hash }) {
		this.source = source;
		this.ast = ast;
		this.filename = filename;
		this.dev = dev;
		if (ast.css && ast.css.children.length) {
			this.id = get_css_hash({
				filename,
				name: component_name,
				css: ast.css.content.styles,
				hash
			});
			this.has_styles = true;

			/** @type {Atrule[]} */
			const stack = [];
			let depth = 0;

			/** @type {Atrule} */
			let current_atrule = null;
			walk(/** @type {any} */ (ast.css), {
				enter: (/** @type {any} */ node) => {
					if (node.type === 'Atrule') {
						const atrule = new Atrule(node);
						stack.push(atrule);
						if (current_atrule) {
							current_atrule.children.push(atrule);
						} else if (depth <= 1) {
							this.children.push(atrule);
						}
						if (is_keyframes_node(node)) {
							node.prelude.children.forEach((expression) => {
								if (expression.type === 'Identifier' && !expression.name.startsWith('-global-')) {
									this.keyframes.set(expression.name, `${this.id}-${expression.name}`);
								}
							});
						} else if (at_rule_has_declaration(node)) {
							const at_rule_declarations = node.block.children
								.filter((node) => node.type === 'Declaration')
								.map((node) => new Declaration(node));
							push_array(atrule.declarations, at_rule_declarations);
						}
						current_atrule = atrule;
					}
					if (node.type === 'Rule') {
						const rule = new Rule(node, this, current_atrule);
						if (current_atrule) {
							current_atrule.children.push(rule);
						} else if (depth <= 1) {
							this.children.push(rule);
						}
					}
					depth += 1;
				},
				leave: (/** @type {any} */ node) => {
					if (node.type === 'Atrule') {
						stack.pop();
						current_atrule = stack[stack.length - 1];
					}
					depth -= 1;
				}
			});
		} else {
			this.has_styles = false;
		}
	}

	/** @param {import('../nodes/Element.js').default} node */
	apply(node) {
		if (!this.has_styles) return;
		for (let i = 0; i < this.children.length; i += 1) {
			const child = this.children[i];
			child.apply(node);
		}
	}
	reify() {
		this.nodes_with_css_class.forEach((node) => {
			node.add_css_class();
		});
	}

	/** @param {string} file */
	render(file) {
		if (!this.has_styles) {
			return { code: null, map: null };
		}
		const code = new MagicString(this.source);
		walk(/** @type {any} */ (this.ast.css), {
			enter: (/** @type {any} */ node) => {
				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);
			}
		});
		const max = Math.max(
			...this.children.map((rule) => rule.get_max_amount_class_specificity_increased())
		);
		this.children.forEach((child) => {
			child.transform(code, this.id, this.keyframes, max);
		});
		let c = 0;
		this.children.forEach((child) => {
			if (child.is_used(this.dev)) {
				code.remove(c, child.node.start);
				child.minify(code, this.dev);
				c = child.node.end;
			}
		});
		code.remove(c, this.source.length);
		return {
			code: code.toString(),
			map: code.generateMap({
				includeContent: true,
				source: this.filename,
				file
			})
		};
	}

	/** @param {import('../Component.js').default} component */
	validate(component) {
		this.children.forEach((child) => {
			child.validate(component);
		});
	}

	/** @param {import('../Component.js').default} component */
	warn_on_unused_selectors(component) {
		const ignores = !this.ast.css
			? []
			: extract_ignores_above_position(this.ast.css.start, this.ast.html.children);
		component.push_ignores(ignores);
		this.children.forEach((child) => {
			child.warn_on_unused_selector((selector) => {
				component.warn(
					selector.node,
					compiler_warnings.css_unused_selector(
						this.source.slice(selector.node.start, selector.node.end)
					)
				);
			});
		});
		component.pop_ignores();
	}
}

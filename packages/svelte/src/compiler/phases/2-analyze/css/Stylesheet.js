import MagicString from 'magic-string';
import { walk } from 'zimmerframe';
import Selector from './Selector.js';
import hash from '../utils/hash.js';
// import compiler_warnings from '../compiler_warnings.js';
// import { extract_ignores_above_position } from '../utils/extract_svelte_ignore.js';
import { push_array } from '../utils/push_array.js';
import { create_attribute } from '../../nodes.js';

const regex_css_browser_prefix = /^-((webkit)|(moz)|(o)|(ms))-/;

/**
 * @param {string} name
 * @returns {string}
 */
function remove_css_prefix(name) {
	return name.replace(regex_css_browser_prefix, '');
}

/** @param {import('#compiler').Css.Atrule} node */
const is_keyframes_node = (node) => remove_css_prefix(node.name) === 'keyframes';

/**
 *
 * @param {import('#compiler').Css.Rule} node
 * @param {MagicString} code
 */
function escape_comment_close(node, code) {
	let escaped = false;
	let in_comment = false;

	for (let i = node.start; i < node.end; i++) {
		if (escaped) {
			escaped = false;
		} else {
			const char = code.original[i];
			if (in_comment) {
				if (char === '*' && code.original[i + 1] === '/') {
					code.prependRight(++i, '\\');
					in_comment = false;
				}
			} else if (char === '\\') {
				escaped = true;
			} else if (char === '/' && code.original[++i] === '*') {
				in_comment = true;
			}
		}
	}
}

class Rule {
	/** @type {import('./Selector.js').default[]} */
	selectors;

	/** @type {Declaration[]} */
	declarations;

	/** @type {import('#compiler').Css.Rule} */
	node;

	/** @type {Atrule | undefined} */
	parent;

	/**
	 * @param {import('#compiler').Css.Rule} node
	 * @param {any} stylesheet
	 * @param {Atrule | undefined} parent
	 */
	constructor(node, stylesheet, parent) {
		this.node = node;
		this.parent = parent;
		this.selectors = node.prelude.children.map((node) => new Selector(node, stylesheet));

		this.declarations = /** @type {import('#compiler').Css.Declaration[]} */ (
			node.block.children
		).map((node) => new Declaration(node));
	}

	/** @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node */
	apply(node) {
		this.selectors.forEach((selector) => selector.apply(node)); // TODO move the logic in here?
	}

	/** @param {boolean} dev */
	is_used(dev) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node))
			return true;

		// keep empty rules in dev, because it's convenient to
		// see them in devtools
		if (this.declarations.length === 0) return dev;

		return this.selectors.some((s) => s.used);
	}

	/**
	 * @param {import('magic-string').default} code
	 * @param {string} id
	 * @param {Map<string, string>} keyframes
	 * @param {number} max_amount_class_specificity_increased
	 */
	transform(code, id, keyframes, max_amount_class_specificity_increased) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node)) {
			return;
		}

		const attr = `.${id}`;
		this.selectors.forEach((selector) =>
			selector.transform(code, attr, max_amount_class_specificity_increased)
		);
		this.declarations.forEach((declaration) => declaration.transform(code, keyframes));
	}

	/** @param {import('../../types.js').ComponentAnalysis} analysis */
	validate(analysis) {
		this.selectors.forEach((selector) => {
			selector.validate(analysis);
		});
	}

	/** @param {(selector: import('./Selector.js').default) => void} handler */
	warn_on_unused_selector(handler) {
		this.selectors.forEach((selector) => {
			if (!selector.used) handler(selector);
		});
	}

	/** @returns number */
	get_max_amount_class_specificity_increased() {
		return Math.max(
			...this.selectors.map((selector) => selector.get_amount_class_specificity_increased())
		);
	}

	/**
	 * @param {MagicString} code
	 * @param {boolean} dev
	 */
	prune(code, dev) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node)) {
			return;
		}

		// keep empty rules in dev, because it's convenient to
		// see them in devtools
		if (this.declarations.length === 0) {
			if (!dev) {
				code.prependRight(this.node.start, '/* (empty) ');
				code.appendLeft(this.node.end, '*/');
				escape_comment_close(this.node, code);
			}

			return;
		}

		const used = this.selectors.filter((s) => s.used);

		if (used.length === 0) {
			code.prependRight(this.node.start, '/* (unused) ');
			code.appendLeft(this.node.end, '*/');
			escape_comment_close(this.node, code);

			return;
		}

		if (used.length < this.selectors.length) {
			let pruning = false;
			let last = this.selectors[0].node.start;

			for (let i = 0; i < this.selectors.length; i += 1) {
				const selector = this.selectors[i];

				if (selector.used === pruning) {
					if (pruning) {
						let i = selector.node.start;
						while (code.original[i] !== ',') i--;

						code.overwrite(i, i + 1, '*/');
					} else {
						if (i === 0) {
							code.prependRight(selector.node.start, '/* (unused) ');
						} else {
							code.overwrite(last, selector.node.start, ' /* (unused) ');
						}
					}

					pruning = !pruning;
				}

				last = selector.node.end;
			}

			if (pruning) {
				code.appendLeft(last, '*/');
			}
		}
	}
}

class Declaration {
	/** @type {import('#compiler').Css.Declaration} */
	node;

	/** @param {import('#compiler').Css.Declaration} node */
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
			const name = /** @type {string} */ (this.node.value)
				.split(' ')
				.find((name) => keyframes.has(name));

			if (name) {
				const start = code.original.indexOf(
					name,
					code.original.indexOf(this.node.property, this.node.start)
				);

				const end = start + name.length;

				const keyframe = /** @type {string} */ (keyframes.get(name));
				code.update(start, end, keyframe);
			}
		}
	}
}

class Atrule {
	/** @type {import('#compiler').Css.Atrule} */
	node;

	/** @type {Array<Atrule | Rule>} */
	children;

	/** @type {Declaration[]} */
	declarations;

	/** @param {import('#compiler').Css.Atrule} node */
	constructor(node) {
		this.node = node;
		this.children = [];
		this.declarations = [];
	}

	/** @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node */
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
			/** @type {Rule[]} */ (this.children).forEach((rule) => {
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
	 * @param {string} id
	 * @param {Map<string, string>} keyframes
	 * @param {number} max_amount_class_specificity_increased
	 */
	transform(code, id, keyframes, max_amount_class_specificity_increased) {
		if (is_keyframes_node(this.node)) {
			let start = this.node.start + this.node.name.length + 1;
			while (code.original[start] === ' ') start += 1;
			let end = start;
			while (code.original[end] !== '{' && code.original[end] !== ' ') end += 1;

			if (this.node.prelude.startsWith('-global-')) {
				code.remove(start, start + 8);
				/** @type {Rule[]} */ (this.children).forEach((rule) => {
					rule.selectors.forEach((selector) => {
						selector.used = true;
					});
				});
			} else {
				const keyframe = /** @type {string} */ (keyframes.get(this.node.prelude));
				code.update(start, end, keyframe);
			}
		}
		this.children.forEach((child) => {
			child.transform(code, id, keyframes, max_amount_class_specificity_increased);
		});
	}

	/** @param {import('../../types.js').ComponentAnalysis} analysis */
	validate(analysis) {
		this.children.forEach((child) => {
			child.validate(analysis);
		});
	}

	/** @param {(selector: import('./Selector.js').default) => void} handler */
	warn_on_unused_selector(handler) {
		if (this.node.name !== 'media') return;
		this.children.forEach((child) => {
			child.warn_on_unused_selector(handler);
		});
	}

	/** @returns {number} */
	get_max_amount_class_specificity_increased() {
		return Math.max(
			...this.children.map((rule) => rule.get_max_amount_class_specificity_increased())
		);
	}

	/**
	 * @param {MagicString} code
	 * @param {boolean} dev
	 */
	prune(code, dev) {
		// TODO prune children
	}
}

export default class Stylesheet {
	/** @type {import('#compiler').Style | null} */
	ast;

	/** @type {string} */
	filename;

	/** @type {boolean} */
	has_styles;

	/** @type {string} */
	id;

	/** @type {Array<Rule | Atrule>} */
	children = [];

	/** @type {Map<string, string>} */
	keyframes = new Map();

	/** @type {Set<import('#compiler').RegularElement | import('#compiler').SvelteElement>} */
	nodes_with_css_class = new Set();

	/**
	 * @param {{
	 * 		ast: import('#compiler').Style | null;
	 * 		filename: string;
	 * 		component_name: string;
	 * 		get_css_hash: import('#compiler').CssHashGetter;
	 * 	}} params
	 */
	constructor({ ast, component_name, filename, get_css_hash }) {
		this.ast = ast;
		this.filename = filename;

		if (!ast || ast.children.length === 0) {
			this.has_styles = false;
			this.id = '';
			return;
		}

		this.id = get_css_hash({
			filename,
			name: component_name,
			css: ast.content.styles,
			hash
		});
		this.has_styles = true;

		const state = {
			/** @type {Atrule | undefined} */
			atrule: undefined
		};

		walk(/** @type {import('#compiler').Css.Node} */ (ast), state, {
			Atrule: (node, context) => {
				const atrule = new Atrule(node);

				if (context.state.atrule) {
					context.state.atrule.children.push(atrule);
				} else {
					this.children.push(atrule);
				}

				if (is_keyframes_node(node)) {
					if (!node.prelude.startsWith('-global-')) {
						this.keyframes.set(node.prelude, `${this.id}-${node.prelude}`);
					}
				} else if (node.block) {
					/** @type {Declaration[]} */
					const declarations = [];

					for (const child of node.block.children) {
						if (child.type === 'Declaration') {
							declarations.push(new Declaration(child));
						}
					}

					if (declarations.length > 0) {
						push_array(atrule.declarations, declarations);
					}
				}

				context.next({
					...context.state,
					atrule
				});
			},
			Rule: (node, context) => {
				const rule = new Rule(node, this, context.state.atrule);
				if (context.state.atrule) {
					context.state.atrule.children.push(rule);
				} else {
					this.children.push(rule);
				}

				context.next();
			}
		});
	}

	/** @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} node */
	apply(node) {
		if (!this.has_styles) return;
		for (let i = 0; i < this.children.length; i += 1) {
			const child = this.children[i];
			child.apply(node);
		}
	}
	/** @param {boolean} is_dom_mode */
	reify(is_dom_mode) {
		nodes: for (const node of this.nodes_with_css_class) {
			// Dynamic elements in dom mode always use spread for attributes and therefore shouldn't have a class attribute added to them
			// TODO this happens during the analysis phase, which shouldn't know anything about client vs server
			if (node.type === 'SvelteElement' && is_dom_mode) continue;

			/** @type {import('#compiler').Attribute | undefined} */
			let class_attribute = undefined;

			for (const attribute of node.attributes) {
				if (attribute.type === 'SpreadAttribute') {
					// The spread method appends the hash to the end of the class attribute on its own
					continue nodes;
				}

				if (attribute.type !== 'Attribute') continue;
				if (attribute.name.toLowerCase() !== 'class') continue;

				class_attribute = attribute;
			}

			if (class_attribute && class_attribute.value !== true) {
				const chunks = class_attribute.value;

				if (chunks.length === 1 && chunks[0].type === 'Text') {
					chunks[0].data += ` ${this.id}`;
				} else {
					chunks.push({
						type: 'Text',
						data: ` ${this.id}`,
						raw: ` ${this.id}`,
						start: -1,
						end: -1,
						parent: null
					});
				}
			} else {
				node.attributes.push(
					create_attribute('class', -1, -1, [
						{ type: 'Text', data: this.id, raw: this.id, parent: null, start: -1, end: -1 }
					])
				);
			}
		}
	}

	/**
	 * @param {string} file
	 * @param {string} source
	 * @param {boolean} dev
	 */
	render(file, source, dev) {
		// TODO neaten this up
		if (!this.ast) throw new Error('Unexpected error');

		const code = new MagicString(source);

		walk(/** @type {import('#compiler').Css.Node} */ (this.ast), null, {
			_: (node) => {
				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);
			}
		});

		const max = Math.max(
			...this.children.map((rule) => rule.get_max_amount_class_specificity_increased())
		);

		for (const child of this.children) {
			child.transform(code, this.id, this.keyframes, max);
		}

		code.remove(0, this.ast.content.start);

		for (const child of this.children) {
			child.prune(code, dev);
		}

		code.remove(/** @type {number} */ (this.ast.content.end), source.length);

		return {
			code: code.toString(),
			map: code.generateMap({
				includeContent: true,
				source: this.filename,
				file
			})
		};
	}

	/** @param {import('../../types.js').ComponentAnalysis} analysis */
	validate(analysis) {
		this.children.forEach((child) => {
			child.validate(analysis);
		});
	}

	/** @param {import('../../types.js').ComponentAnalysis} analysis */
	warn_on_unused_selectors(analysis) {
		// const ignores = !this.ast
		// 	? []
		// 	: extract_ignores_above_position(this.ast.css.start, this.ast.html.children);
		// analysis.push_ignores(ignores);
		// this.children.forEach((child) => {
		// 	child.warn_on_unused_selector((selector) => {
		// 		analysis.warn(selector.node, {
		// 			code: 'css-unused-selector',
		// 			message: `Unused CSS selector "${this.source.slice(
		// 				selector.node.start,
		// 				selector.node.end
		// 			)}"`
		// 		});
		// 	});
		// });
		// analysis.pop_ignores();
	}
}

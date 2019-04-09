import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import Selector from './Selector';
import Element from '../nodes/Element';
import { Node, Ast } from '../../interfaces';
import Component from '../Component';

function remove_css_prefix(name: string): string {
	return name.replace(/^-((webkit)|(moz)|(o)|(ms))-/, '');
}

const is_keyframes_node = (node: Node) => remove_css_prefix(node.name) === 'keyframes';

// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str: string): string {
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return (hash >>> 0).toString(36);
}

class Rule {
	selectors: Selector[];
	declarations: Declaration[];
	node: Node;
	parent: Atrule;

	constructor(node: Node, stylesheet, parent?: Atrule) {
		this.node = node;
		this.parent = parent;
		this.selectors = node.selector.children.map((node: Node) => new Selector(node, stylesheet));
		this.declarations = node.block.children.map((node: Node) => new Declaration(node));
	}

	apply(node: Element, stack: Element[]) {
		this.selectors.forEach(selector => selector.apply(node, stack)); // TODO move the logic in here?
	}

	is_used(dev: boolean) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node)) return true;
		if (this.declarations.length === 0) return dev;
		return this.selectors.some(s => s.used);
	}

	minify(code: MagicString, dev: boolean) {
		let c = this.node.start;
		let started = false;

		this.selectors.forEach((selector, i) => {
			if (selector.used) {
				const separator = started ? ',' : '';
				if ((selector.node.start - c) > separator.length) {
					code.overwrite(c, selector.node.start, separator);
				}

				selector.minify(code);
				c = selector.node.end;

				started = true;
			}
		});

		code.remove(c, this.node.block.start);

		c = this.node.block.start + 1;
		this.declarations.forEach((declaration, i) => {
			const separator = i > 0 ? ';' : '';
			if ((declaration.node.start - c) > separator.length) {
				code.overwrite(c, declaration.node.start, separator);
			}

			declaration.minify(code);

			c = declaration.node.end;
		});

		code.remove(c, this.node.block.end - 1);
	}

	transform(code: MagicString, id: string, keyframes: Map<string, string>) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node)) return true;

		const attr = `.${id}`;

		this.selectors.forEach(selector => selector.transform(code, attr));
		this.declarations.forEach(declaration => declaration.transform(code, keyframes));
	}

	validate(component: Component) {
		this.selectors.forEach(selector => {
			selector.validate(component);
		});
	}

	warn_on_unused_selector(handler: (selector: Selector) => void) {
		this.selectors.forEach(selector => {
			if (!selector.used) handler(selector);
		});
	}
}

class Declaration {
	node: Node;

	constructor(node: Node) {
		this.node = node;
	}

	transform(code: MagicString, keyframes: Map<string, string>) {
		const property = this.node.property && remove_css_prefix(this.node.property.toLowerCase());
		if (property === 'animation' || property === 'animation-name') {
			this.node.value.children.forEach((block: Node) => {
				if (block.type === 'Identifier') {
					const name = block.name;
					if (keyframes.has(name)) {
						code.overwrite(block.start, block.end, keyframes.get(name));
					}
				}
			});
		}
	}

	minify(code: MagicString) {
		if (!this.node.property) return; // @apply, and possibly other weird cases?

		const c = this.node.start + this.node.property.length;
		const first = this.node.value.children
			? this.node.value.children[0]
			: this.node.value;

		let start = first.start;
		while (/\s/.test(code.original[start])) start += 1;

		if (start - c > 1) {
			code.overwrite(c, start, ':');
		}
	}
}

class Atrule {
	node: Node;
	children: (Atrule|Rule)[];

	constructor(node: Node) {
		this.node = node;
		this.children = [];
	}

	apply(node: Element, stack: Element[]) {
		if (this.node.name === 'media' || this.node.name === 'supports') {
			this.children.forEach(child => {
				child.apply(node, stack);
			});
		}

		else if (is_keyframes_node(this.node)) {
			this.children.forEach((rule: Rule) => {
				rule.selectors.forEach(selector => {
					selector.used = true;
				});
			});
		}
	}

	is_used(dev: boolean) {
		return true; // TODO
	}

	minify(code: MagicString, dev: boolean) {
		if (this.node.name === 'media') {
			const expression_char = code.original[this.node.expression.start];
			let c = this.node.start + (expression_char === '(' ? 6 : 7);
			if (this.node.expression.start > c) code.remove(c, this.node.expression.start);

			this.node.expression.children.forEach((query: Node) => {
				// TODO minify queries
				c = query.end;
			});

			code.remove(c, this.node.block.start);
		} else if (is_keyframes_node(this.node)) {
			let c = this.node.start + this.node.name.length + 1;
			if (this.node.expression.start - c > 1) code.overwrite(c, this.node.expression.start, ' ');
			c = this.node.expression.end;
			if (this.node.block.start - c > 0) code.remove(c, this.node.block.start);
		} else if (this.node.name === 'supports') {
			let c = this.node.start + 9;
			if (this.node.expression.start - c > 1) code.overwrite(c, this.node.expression.start, ' ');
			this.node.expression.children.forEach((query: Node) => {
				// TODO minify queries
				c = query.end;
			});
			code.remove(c, this.node.block.start);
		}

		// TODO other atrules

		if (this.node.block) {
			let c = this.node.block.start + 1;

			this.children.forEach(child => {
				if (child.is_used(dev)) {
					code.remove(c, child.node.start);
					child.minify(code, dev);
					c = child.node.end;
				}
			});

			code.remove(c, this.node.block.end - 1);
		}
	}

	transform(code: MagicString, id: string, keyframes: Map<string, string>) {
		if (is_keyframes_node(this.node)) {
			this.node.expression.children.forEach(({ type, name, start, end }: Node) => {
				if (type === 'Identifier') {
					if (name.startsWith('-global-')) {
						code.remove(start, start + 8);
					} else {
						code.overwrite(start, end, keyframes.get(name));
					}
				}
			});
		}

		this.children.forEach(child => {
			child.transform(code, id, keyframes);
		});
	}

	validate(component: Component) {
		this.children.forEach(child => {
			child.validate(component);
		});
	}

	warn_on_unused_selector(handler: (selector: Selector) => void) {
		if (this.node.name !== 'media') return;

		this.children.forEach(child => {
			child.warn_on_unused_selector(handler);
		});
	}
}

export default class Stylesheet {
	source: string;
	ast: Ast;
	filename: string;
	dev: boolean;

	has_styles: boolean;
	id: string;

	children: (Rule|Atrule)[] = [];
	keyframes: Map<string, string> = new Map();

	nodes_with_css_class: Set<Node> = new Set();

	constructor(source: string, ast: Ast, filename: string, dev: boolean) {
		this.source = source;
		this.ast = ast;
		this.filename = filename;
		this.dev = dev;

		if (ast.css && ast.css.children.length) {
			this.id = `svelte-${hash(ast.css.content.styles)}`;

			this.has_styles = true;

			const stack: (Rule | Atrule)[] = [];
			let current_atrule: Atrule = null;

			walk(ast.css, {
				enter: (node: Node) => {
					if (node.type === 'Atrule') {
						const last = stack[stack.length - 1];

						const atrule = new Atrule(node);
						stack.push(atrule);

						// this is an awkward special case — @apply (and
						// possibly other future constructs)
						if (last && !(last instanceof Atrule)) return;

						if (current_atrule) {
							current_atrule.children.push(atrule);
						} else {
							this.children.push(atrule);
						}

						if (is_keyframes_node(node)) {
							node.expression.children.forEach((expression: Node) => {
								if (expression.type === 'Identifier' && !expression.name.startsWith('-global-')) {
									this.keyframes.set(expression.name, `${this.id}-${expression.name}`);
								}
							});
						}

						current_atrule = atrule;
					}

					if (node.type === 'Rule') {
						const rule = new Rule(node, this, current_atrule);
						stack.push(rule);

						if (current_atrule) {
							current_atrule.children.push(rule);
						} else {
							this.children.push(rule);
						}
					}
				},

				leave: (node: Node) => {
					if (node.type === 'Rule' || node.type === 'Atrule') stack.pop();
					if (node.type === 'Atrule') current_atrule = stack[stack.length - 1] as Atrule;
				}
			});
		} else {
			this.has_styles = false;
		}
	}

	apply(node: Element) {
		if (!this.has_styles) return;

		const stack: Element[] = [];
		let parent: Node = node;
		while (parent = parent.parent) {
			if (parent.type === 'Element') stack.unshift(parent as Element);
		}

		for (let i = 0; i < this.children.length; i += 1) {
			const child = this.children[i];
			child.apply(node, stack);
		}
	}

	reify() {
		this.nodes_with_css_class.forEach((node: Node) => {
			node.add_css_class();
		});
	}

	render(file: string, should_transform_selectors: boolean) {
		if (!this.has_styles) {
			return { code: null, map: null };
		}

		const code = new MagicString(this.source);

		walk(this.ast.css, {
			enter: (node: Node) => {
				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);
			}
		});

		if (should_transform_selectors) {
			this.children.forEach((child: (Atrule|Rule)) => {
				child.transform(code, this.id, this.keyframes);
			});
		}

		let c = 0;
		this.children.forEach(child => {
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

	validate(component: Component) {
		this.children.forEach(child => {
			child.validate(component);
		});
	}

	warn_on_unused_selectors(component: Component) {
		this.children.forEach(child => {
			child.warn_on_unused_selector((selector: Selector) => {
				component.warn(selector.node, {
					code: `css-unused-selector`,
					message: `Unused CSS selector`
				});
			});
		});
	}
}

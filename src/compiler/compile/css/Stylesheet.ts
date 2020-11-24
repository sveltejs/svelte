import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import Selector from './Selector';
import Element from '../nodes/Element';
import { Ast } from '../../interfaces';
import Component from '../Component';
import { CssNode } from './interfaces';
import hash from '../utils/hash';

function remove_css_prefix(name: string): string {
	return name.replace(/^-((webkit)|(moz)|(o)|(ms))-/, '');
}

const is_keyframes_node = (node: CssNode) =>
	remove_css_prefix(node.name) === 'keyframes';

const at_rule_has_declaration = ({ block }: CssNode): true =>
	block &&
	block.children &&
	block.children.find((node: CssNode) => node.type === 'Declaration');

function minify_declarations(
	code: MagicString,
	start: number,
	declarations: Declaration[]
): number {
	let c = start;

	declarations.forEach((declaration, i) => {
		const separator = i > 0 ? ';' : '';
		if ((declaration.node.start - c) > separator.length) {
			code.overwrite(c, declaration.node.start, separator);
		}
		declaration.minify(code);
		c = declaration.node.end;
	});

	return c;
}

class Rule {
	selectors: Selector[];
	declarations: Declaration[];
	node: CssNode;
	parent: Atrule;

	constructor(node: CssNode, stylesheet, parent?: Atrule) {
		this.node = node;
		this.parent = parent;
		this.selectors = node.selector.children.map((node: CssNode) => new Selector(node, stylesheet));
		this.declarations = node.block.children.map((node: CssNode) => new Declaration(node));
	}

	apply(node: Element) {
		this.selectors.forEach(selector => selector.apply(node)); // TODO move the logic in here?
	}

	is_used(dev: boolean) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node)) return true;
		if (this.declarations.length === 0) return dev;
		return this.selectors.some(s => s.used);
	}

	minify(code: MagicString, _dev: boolean) {
		let c = this.node.start;
		let started = false;

		this.selectors.forEach((selector) => {
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
		c = minify_declarations(code, c, this.declarations);

		code.remove(c, this.node.block.end - 1);
	}

	transform(code: MagicString, id: string, keyframes: Map<string, string>, max_amount_class_specificity_increased: number) {
		if (this.parent && this.parent.node.type === 'Atrule' && is_keyframes_node(this.parent.node)) return true;

		const attr = `.${id}`;

		this.selectors.forEach(selector => selector.transform(code, attr, max_amount_class_specificity_increased));
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

	get_max_amount_class_specificity_increased() {
		return Math.max(...this.selectors.map(selector => selector.get_amount_class_specificity_increased()));
	}
}

class Declaration {
	node: CssNode;

	constructor(node: CssNode) {
		this.node = node;
	}

	transform(code: MagicString, keyframes: Map<string, string>) {
		const property = this.node.property && remove_css_prefix(this.node.property.toLowerCase());
		if (property === 'animation' || property === 'animation-name') {
			this.node.value.children.forEach((block: CssNode) => {
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
	node: CssNode;
	children: Array<Atrule|Rule>;
	declarations: Declaration[];

	constructor(node: CssNode) {
		this.node = node;
		this.children = [];
		this.declarations = [];
	}

	apply(node: Element) {
		if (this.node.name === 'media' || this.node.name === 'supports') {
			this.children.forEach(child => {
				child.apply(node);
			});
		} else if (is_keyframes_node(this.node)) {
			this.children.forEach((rule: Rule) => {
				rule.selectors.forEach(selector => {
					selector.used = true;
				});
			});
		}
	}

	is_used(_dev: boolean) {
		return true; // TODO
	}

	minify(code: MagicString, dev: boolean) {
		if (this.node.name === 'media') {
			const expression_char = code.original[this.node.expression.start];
			let c = this.node.start + (expression_char === '(' ? 6 : 7);
			if (this.node.expression.start > c) code.remove(c, this.node.expression.start);

			this.node.expression.children.forEach((query: CssNode) => {
				// TODO minify queries
				c = query.end;
			});

			code.remove(c, this.node.block.start);
		} else if (this.node.name === 'supports') {
			let c = this.node.start + 9;
			if (this.node.expression.start - c > 1) code.overwrite(c, this.node.expression.start, ' ');
			this.node.expression.children.forEach((query: CssNode) => {
				// TODO minify queries
				c = query.end;
			});
			code.remove(c, this.node.block.start);
		} else {
			let c = this.node.start + this.node.name.length + 1;
			if (this.node.expression) {
				if (this.node.expression.start - c > 1) code.overwrite(c, this.node.expression.start, ' ');
				c = this.node.expression.end;
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

	transform(code: MagicString, id: string, keyframes: Map<string, string>, max_amount_class_specificity_increased: number) {
		if (is_keyframes_node(this.node)) {
			this.node.expression.children.forEach(({ type, name, start, end }: CssNode) => {
				if (type === 'Identifier') {
					if (name.startsWith('-global-')) {
						code.remove(start, start + 8);
						this.children.forEach((rule: Rule) => {
							rule.selectors.forEach(selector => {
								selector.used = true;
							});
						});
					} else {
						code.overwrite(start, end, keyframes.get(name));
					}
				}
			});
		}

		this.children.forEach(child => {
			child.transform(code, id, keyframes, max_amount_class_specificity_increased);
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

	get_max_amount_class_specificity_increased() {
		return Math.max(...this.children.map(rule => rule.get_max_amount_class_specificity_increased()));
	}
}

export default class Stylesheet {
	source: string;
	ast: Ast;
	filename: string;
	dev: boolean;

	has_styles: boolean;
	id: string;

	children: Array<Rule|Atrule> = [];
	keyframes: Map<string, string> = new Map();

	nodes_with_css_class: Set<CssNode> = new Set();

	constructor(source: string, ast: Ast, filename: string, dev: boolean) {
		this.source = source;
		this.ast = ast;
		this.filename = filename;
		this.dev = dev;

		if (ast.css && ast.css.children.length) {
			this.id = `svelte-${hash(ast.css.content.styles)}`;

			this.has_styles = true;

			const stack: Atrule[] = [];
			let depth = 0;
			let current_atrule: Atrule = null;

			walk(ast.css as any, {
				enter: (node: any) => {
					if (node.type === 'Atrule') {
						const atrule = new Atrule(node);
						stack.push(atrule);

						if (current_atrule) {
							current_atrule.children.push(atrule);
						} else if (depth <= 1) {
							this.children.push(atrule);
						}

						if (is_keyframes_node(node)) {
							node.expression.children.forEach((expression: CssNode) => {
								if (expression.type === 'Identifier' && !expression.name.startsWith('-global-')) {
									this.keyframes.set(expression.name, `${this.id}-${expression.name}`);
								}
							});
						} else if (at_rule_has_declaration(node)) {
							const at_rule_declarations = node.block.children
								.filter(node => node.type === 'Declaration')
								.map(node => new Declaration(node));
							atrule.declarations.push(...at_rule_declarations);
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

				leave: (node: any) => {
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

	apply(node: Element) {
		if (!this.has_styles) return;

		for (let i = 0; i < this.children.length; i += 1) {
			const child = this.children[i];
			child.apply(node);
		}
	}

	reify() {
		this.nodes_with_css_class.forEach((node: Element) => {
			node.add_css_class();
		});
	}

	render(file: string, should_transform_selectors: boolean) {
		if (!this.has_styles) {
			return { code: null, map: null };
		}

		const code = new MagicString(this.source);

		walk(this.ast.css as any, {
			enter: (node: any) => {
				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);
			}
		});

		if (should_transform_selectors) {
			const max = Math.max(...this.children.map(rule => rule.get_max_amount_class_specificity_increased()));
			this.children.forEach((child: (Atrule|Rule)) => {
				child.transform(code, this.id, this.keyframes, max);
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
					code: 'css-unused-selector',
					message: `Unused CSS selector "${this.source.slice(selector.node.start, selector.node.end)}"`
				});
			});
		});
	}
}

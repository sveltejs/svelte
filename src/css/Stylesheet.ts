import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import { getLocator } from 'locate-character';
import Selector from './Selector';
import getCodeFrame from '../utils/getCodeFrame';
import hash from '../utils/hash';
import isKeyframesNode from '../utils/isKeyframesNode';
import Element from '../compile/nodes/Element';
import { Validator } from '../validate/index';
import { Node, Ast, Warning } from '../interfaces';

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

	isUsed(dev: boolean) {
		if (this.parent && this.parent.node.type === 'Atrule' && isKeyframesNode(this.parent.node)) return true;
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
		if (this.parent && this.parent.node.type === 'Atrule' && isKeyframesNode(this.parent.node)) return true;

		const attr = `.${id}`;

		this.selectors.forEach(selector => selector.transform(code, attr));
		this.declarations.forEach(declaration => declaration.transform(code, keyframes));
	}

	validate(validator: Validator) {
		this.selectors.forEach(selector => {
			selector.validate(validator);
		});
	}

	warnOnUnusedSelector(handler: (selector: Selector) => void) {
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
		const property = this.node.property && this.node.property.toLowerCase();
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
		const first = this.node.value.children  ?
			this.node.value.children[0] :
			this.node.value;

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

		else if (isKeyframesNode(this.node)) {
			this.children.forEach((rule: Rule) => {
				rule.selectors.forEach(selector => {
					selector.used = true;
				});
			});
		}
	}

	isUsed(dev: boolean) {
		return true; // TODO
	}

	minify(code: MagicString, dev: boolean) {
		if (this.node.name === 'media') {
			const expressionChar = code.original[this.node.expression.start];
			let c = this.node.start + (expressionChar === '(' ? 6 : 7);
			if (this.node.expression.start > c) code.remove(c, this.node.expression.start);

			this.node.expression.children.forEach((query: Node) => {
				// TODO minify queries
				c = query.end;
			});

			code.remove(c, this.node.block.start);
		} else if (isKeyframesNode(this.node)) {
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
				if (child.isUsed(dev)) {
					code.remove(c, child.node.start);
					child.minify(code, dev);
					c = child.node.end;
				}
			});

			code.remove(c, this.node.block.end - 1);
		}
	}

	transform(code: MagicString, id: string, keyframes: Map<string, string>) {
		if (isKeyframesNode(this.node)) {
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
		})
	}

	validate(validator: Validator) {
		this.children.forEach(child => {
			child.validate(validator);
		});
	}

	warnOnUnusedSelector(handler: (selector: Selector) => void) {
		if (this.node.name !== 'media') return;

		this.children.forEach(child => {
			child.warnOnUnusedSelector(handler);
		});
	}
}

const keys = {};

export default class Stylesheet {
	source: string;
	ast: Ast;
	filename: string;
	dev: boolean;

	hasStyles: boolean;
	id: string;

	children: (Rule|Atrule)[];
	keyframes: Map<string, string>;

	nodesWithCssClass: Set<Node>;
	nodesWithRefCssClass: Map<String, Node>;

	constructor(source: string, ast: Ast, filename: string, dev: boolean) {
		this.source = source;
		this.ast = ast;
		this.filename = filename;
		this.dev = dev;

		this.children = [];
		this.keyframes = new Map();

		this.nodesWithCssClass = new Set();
		this.nodesWithRefCssClass = new Map();

		if (ast.css && ast.css.children.length) {
			this.id = `svelte-${hash(ast.css.content.styles)}`;

			this.hasStyles = true;

			const stack: (Rule | Atrule)[] = [];
			let currentAtrule: Atrule = null;

			walk(this.ast.css, {
				enter: (node: Node) => {
					if (node.type === 'Atrule') {
						const last = stack[stack.length - 1];

						const atrule = new Atrule(node);
						stack.push(atrule);

						// this is an awkward special case — @apply (and
						// possibly other future constructs)
						if (last && !(last instanceof Atrule)) return;

						if (currentAtrule) {
							currentAtrule.children.push(atrule);
						} else {
							this.children.push(atrule);
						}

						if (isKeyframesNode(node)) {
							node.expression.children.forEach((expression: Node) => {
								if (expression.type === 'Identifier' && !expression.name.startsWith('-global-')) {
									this.keyframes.set(expression.name, `${this.id}-${expression.name}`);
								}
							});
						}

						currentAtrule = atrule;
					}

					if (node.type === 'Rule') {
						const rule = new Rule(node, this, currentAtrule);
						stack.push(rule);

						if (currentAtrule) {
							currentAtrule.children.push(rule);
						} else {
							this.children.push(rule);
						}
					}
				},

				leave: (node: Node) => {
					if (node.type === 'Rule' || node.type === 'Atrule') stack.pop();
					if (node.type === 'Atrule') currentAtrule = <Atrule>stack[stack.length - 1];
				}
			});
		} else {
			this.hasStyles = false;
		}
	}

	apply(node: Element) {
		if (!this.hasStyles) return;

		const stack: Element[] = [];
		let parent: Node = node;
		while (parent = parent.parent) {
			if (parent.type === 'Element') stack.unshift(<Element>parent);
		}

		for (let i = 0; i < this.children.length; i += 1) {
			const child = this.children[i];
			child.apply(node, stack);
		}
	}

	reify() {
		this.nodesWithCssClass.forEach((node: Node) => {
			node.addCssClass();
		});
		this.nodesWithRefCssClass.forEach((node: Node, name: String) => {
			node.addCssClass(`svelte-ref-${name}`);
		})
	}

	render(cssOutputFilename: string, shouldTransformSelectors: boolean) {
		if (!this.hasStyles) {
			return { code: null, map: null };
		}

		const code = new MagicString(this.source);

		walk(this.ast.css, {
			enter: (node: Node) => {
				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);
			}
		});

		if (shouldTransformSelectors) {
			this.children.forEach((child: (Atrule|Rule)) => {
				child.transform(code, this.id, this.keyframes);
			});
		}

		let c = 0;
		this.children.forEach(child => {
			if (child.isUsed(this.dev)) {
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
				file: cssOutputFilename
			})
		};
	}

	validate(validator: Validator) {
		this.children.forEach(child => {
			child.validate(validator);
		});
	}

	warnOnUnusedSelectors(onwarn: (warning: Warning) => void) {
		let locator;

		const handler = (selector: Selector) => {
			const pos = selector.node.start;

			if (!locator) locator = getLocator(this.source, { offsetLine: 1 });
			const start = locator(pos);
			const end = locator(selector.node.end);

			const frame = getCodeFrame(this.source, start.line - 1, start.column);
			const message = `Unused CSS selector`;

			onwarn({
				code: `css-unused-selector`,
				message,
				frame,
				start,
				end,
				pos,
				filename: this.filename,
				toString: () => `${message} (${start.line}:${start.column})\n${frame}`,
			});
		};

		this.children.forEach(child => {
			child.warnOnUnusedSelector(handler);
		});
	}
}

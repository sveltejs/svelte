import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import { getLocator } from 'locate-character';
import Selector from './Selector';
import getCodeFrame from '../utils/getCodeFrame';
import { Validator } from '../validate/index';
import { Node, Parsed, Warning } from '../interfaces';

class Rule {
	selectors: Selector[];
	declarations: Node[];

	constructor(node: Node) {
		this.selectors = node.selector.children.map((node: Node) => new Selector(node));
		this.declarations = node.block.children;
	}

	apply(node: Node, stack: Node[]) {
		this.selectors.forEach(selector => selector.apply(node, stack)); // TODO move the logic in here?
	}

	transform(code: MagicString, id: string, keyframes: Map<string, string>, cascade: boolean) {
		const attr = `[${id}]`;

		if (cascade) {
			this.selectors.forEach(selector => {
				// TODO disable cascading (without :global(...)) in v2
				const { start, end, children } = selector.node;

				const css = code.original;
				const selectorString = css.slice(start, end);

				const firstToken = children[0];

				let transformed;

				if (firstToken.type === 'TypeSelector') {
					const insert = firstToken.end;
					const head = firstToken.name === '*' ? '' : css.slice(start, insert);
					const tail = css.slice(insert, end);

					transformed = `${head}${attr}${tail}, ${attr} ${selectorString}`;
				} else {
					transformed = `${attr}${selectorString}, ${attr} ${selectorString}`;
				}

				code.overwrite(start, end, transformed);
			});
		} else {
			this.selectors.forEach(selector => selector.transform(code, attr));
		}

		this.declarations.forEach((declaration: Node) => {
			const property = declaration.property.toLowerCase();
			if (property === 'animation' || property === 'animation-name') {
				declaration.value.children.forEach((block: Node) => {
					if (block.type === 'Identifier') {
						const name = block.name;
						if (keyframes.has(name)) {
							code.overwrite(block.start, block.end, keyframes.get(name));
						}
					}
				});
			}
		});
	}
}

class Atrule {
	node: Node;

	constructor(node: Node) {
		this.node = node;
	}

	transform(code: MagicString, id: string, keyframes: Map<string, string>) {
		if (this.node.name !== 'keyframes') return;

		this.node.expression.children.forEach((expression: Node) => {
			if (expression.type === 'Identifier') {
				if (expression.name.startsWith('-global-')) {
					code.remove(expression.start, expression.start + 8);
				} else {
					const newName = `${id}-${expression.name}`;
					code.overwrite(expression.start, expression.end, newName);
					keyframes.set(expression.name, newName);
				}
			}
		});
	}
}

const keys = {};

export default class Stylesheet {
	source: string;
	parsed: Parsed;
	cascade: boolean;
	filename: string;

	hasStyles: boolean;
	id: string;

	nodes: (Rule|Atrule)[];
	rules: Rule[];
	atrules: Atrule[];

	constructor(source: string, parsed: Parsed, filename: string, cascade: boolean) {
		this.source = source;
		this.parsed = parsed;
		this.cascade = cascade;
		this.filename = filename;

		this.id = `svelte-${parsed.hash}`;

		this.nodes = [];
		this.rules = [];
		this.atrules = [];

		if (parsed.css && parsed.css.children.length) {
			this.hasStyles = true;

			const stack: Atrule[] = [];
			let currentAtrule: Atrule = null;

			walk(this.parsed.css, {
				enter: (node: Node) => {
					if (node.type === 'Atrule') {
						const atrule = currentAtrule = new Atrule(node);
						stack.push(atrule);

						this.nodes.push(atrule);
						this.atrules.push(atrule);
					}

					if (node.type === 'Rule' && (!currentAtrule || /(media|supports|document)/.test(currentAtrule.node.name))) {
						const rule = new Rule(node);
						this.nodes.push(rule);
						this.rules.push(rule);
					}
				},

				leave: (node: Node) => {
					if (node.type === 'Atrule') {
						stack.pop();
						currentAtrule = stack[stack.length - 1];
					}
				}
			});
		} else {
			this.hasStyles = false;
		}
	}

	apply(node: Node, stack: Node[]) {
		if (!this.hasStyles) return;

		if (this.cascade) {
			if (stack.length === 0) node._needsCssAttribute = true;
			return;
		}

		for (let i = 0; i < this.rules.length; i += 1) {
			const rule = this.rules[i];
			rule.apply(node, stack);
		}
	}

	render(cssOutputFilename: string) {
		if (!this.hasStyles) {
			return { css: null, cssMap: null };
		}

		const code = new MagicString(this.source);
		code.remove(0, this.parsed.css.start + 7);
		code.remove(this.parsed.css.end - 8, this.source.length);

		const keyframes = new Map();
		this.atrules.forEach((atrule: Atrule) => {
			atrule.transform(code, this.id, keyframes);
		});

		this.rules.forEach((rule: Rule) => {
			rule.transform(code, this.id, keyframes, this.cascade);
		});

		return {
			css: code.toString(),
			cssMap: code.generateMap({
				includeContent: true,
				source: this.filename,
				file: cssOutputFilename
			})
		};
	}

	validate(validator: Validator) {
		this.rules.forEach(rule => {
			rule.selectors.forEach(selector => {
				selector.validate(validator);
			});
		});
	}

	warnOnUnusedSelectors(onwarn: (warning: Warning) => void) {
		if (this.cascade) return;

		let locator;

		this.rules.forEach((rule: Rule) => {
			rule.selectors.forEach(selector => {
				if (!selector.used) {
					const pos = selector.node.start;

					if (!locator) locator = getLocator(this.source);
					const { line, column } = locator(pos);

					const frame = getCodeFrame(this.source, line, column);
					const message = `Unused CSS selector`;

					onwarn({
						message,
						frame,
						loc: { line: line + 1, column },
						pos,
						filename: this.filename,
						toString: () => `${message} (${line + 1}:${column})\n${frame}`,
					});
				}
			});
		});
	}
}
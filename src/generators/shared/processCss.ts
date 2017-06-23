import MagicString from 'magic-string';
import { Parsed, Node } from '../../interfaces';

const commentsPattern = /\/\*[\s\S]*?\*\//g;

export default function processCss(
	parsed: Parsed,
	code: MagicString,
	cascade: boolean
) {
	const css = parsed.css.content.styles;
	const offset = parsed.css.content.start;

	const attr = `[svelte-${parsed.hash}]`;

	const keyframes = new Map();

	function walkKeyframes(node: Node) {
		if (node.type === 'Atrule' && node.name.toLowerCase() === 'keyframes') {
			node.expression.children.forEach((expression: Node) => {
				if (expression.type === 'Identifier') {
					if (expression.name.startsWith('-global-')) {
						code.remove(expression.start, expression.start + 8);
					} else {
						const newName = `svelte-${parsed.hash}-${expression.name}`;
						code.overwrite(expression.start, expression.end, newName);
						keyframes.set(expression.name, newName);
					}
				}
			});
		} else if (node.children) {
			node.children.forEach(walkKeyframes);
		} else if (node.block) {
			walkKeyframes(node.block);
		}
	}

	parsed.css.children.forEach(walkKeyframes);

	function transform(rule: Node) {
		rule.selector.children.forEach((selector: Node) => {
			if (cascade) {
				// TODO disable cascading (without :global(...)) in v2
				const start = selector.start - offset;
				const end = selector.end - offset;

				const selectorString = css.slice(start, end);

				const firstToken = selector.children[0];

				let transformed;

				if (firstToken.type === 'TypeSelector') {
					const insert = firstToken.end - offset;
					const head = css.slice(start, insert);
					const tail = css.slice(insert, end);

					transformed = `${head}${attr}${tail}, ${attr} ${selectorString}`;
				} else {
					transformed = `${attr}${selectorString}, ${attr} ${selectorString}`;
				}

				code.overwrite(selector.start, selector.end, transformed);
			} else {
				let shouldTransform = true;
				let c = selector.start;

				selector.children.forEach((child: Node) => {
					if (child.type === 'WhiteSpace' || child.type === 'Combinator') {
						code.appendLeft(c, attr);
						shouldTransform = true;
						return;
					}

					if (!shouldTransform) return;

					if (child.type === 'PseudoClassSelector') {
						// `:global(xyz)` > xyz
						if (child.name === 'global') {
							const first = child.children[0];
							const last = child.children[child.children.length - 1];
							code.remove(child.start, first.start).remove(last.end, child.end);
						} else {
							code.prependRight(c, attr);
						}

						shouldTransform = false;
					}

					else if (child.type === 'PseudoElementSelector') {
						code.prependRight(c, attr);
						shouldTransform = false;
					}

					c = child.end;
				});

				if (shouldTransform) {
					code.appendLeft(c, attr);
				}
			}
		});

		rule.block.children.forEach((block: Node) => {
			if (block.type === 'Declaration') {
				const property = block.property.toLowerCase();
				if (property === 'animation' || property === 'animation-name') {
					block.value.children.forEach((block: Node) => {
						if (block.type === 'Identifier') {
							const name = block.name;
							if (keyframes.has(name)) {
								code.overwrite(block.start, block.end, keyframes.get(name));
							}
						}
					});
				}
			}
		});
	}

	function walk(node: Node) {
		if (node.type === 'Rule') {
			transform(node);
		} else if (
			node.type === 'Atrule' &&
			node.name.toLowerCase() === 'keyframes'
		) {
			// these have already been processed
		} else if (node.children) {
			node.children.forEach(walk);
		} else if (node.block) {
			walk(node.block);
		}
	}

	parsed.css.children.forEach(walk);

	// remove comments. TODO would be nice if this was exposed in css-tree
	let match;
	while ((match = commentsPattern.exec(css))) {
		const start = match.index + offset;
		const end = start + match[0].length;

		code.remove(start, end);
	}

	return code.slice(parsed.css.content.start, parsed.css.content.end);
}

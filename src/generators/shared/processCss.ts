import MagicString from 'magic-string';
import { groupSelectors, isGlobalSelector, walkRules } from '../../utils/css';
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

	function encapsulateBlock(block: Node[]) {
		let i = block.length;
		while (i--) {
			const child = block[i];
			if (child.type === 'PseudoElementSelector' || child.type === 'PseudoClassSelector') continue;

			if (child.type === 'TypeSelector' && child.name === '*') {
				code.overwrite(child.start, child.end, attr);
			} else {
				code.appendLeft(child.end, attr);
			}

			return;
		}
	}

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
					const head = firstToken.name === '*' ? css.slice(firstToken.end - offset, insert) : css.slice(start, insert);
					const tail = css.slice(insert, end);

					transformed = `${head}${attr}${tail}, ${attr} ${selectorString}`;
				} else {
					transformed = `${attr}${selectorString}, ${attr} ${selectorString}`;
				}

				code.overwrite(selector.start, selector.end, transformed);
			} else {
				let shouldTransform = true;
				let c = selector.start;

				// separate .foo > .bar > .baz into three separate blocks, so
				// that we can transform only the first and last
				let block: Node[] = [];
				const blocks: Node[][] = groupSelectors(selector);

				blocks.forEach((block: Node[], i) => {
					if (i === 0 || i === blocks.length - 1) {
						encapsulateBlock(blocks[i]);
					}

					if (isGlobalSelector(block)) {
						const selector = block[0];
						const first = selector.children[0];
						const last = selector.children[selector.children.length - 1];
						code.remove(selector.start, first.start).remove(last.end, selector.end);
					}
				});
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

	walkRules(parsed.css.children, transform);

	// remove comments. TODO would be nice if this was exposed in css-tree
	let match;
	while ((match = commentsPattern.exec(css))) {
		const start = match.index + offset;
		const end = start + match[0].length;

		code.remove(start, end);
	}

	return code.slice(parsed.css.content.start, parsed.css.content.end);
}

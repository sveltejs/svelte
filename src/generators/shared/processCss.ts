import MagicString from 'magic-string';
import { groupSelectors, isGlobalSelector, walkRules } from '../../utils/css';
import Generator from '../Generator';
import { Node } from '../../interfaces';

const commentsPattern = /\/\*[\s\S]*?\*\//g;

export default function processCss(
	generator: Generator,
	code: MagicString,
	cascade: boolean
) {
	const css = generator.parsed.css.content.styles;
	const offset = generator.parsed.css.content.start;

	const attr = `[svelte-${generator.parsed.hash}]`;

	const keyframes = new Map();

	function walkKeyframes(node: Node) {
		if (node.type === 'Atrule' && node.name.toLowerCase() === 'keyframes') {
			node.expression.children.forEach((expression: Node) => {
				if (expression.type === 'Identifier') {
					if (expression.name.startsWith('-global-')) {
						code.remove(expression.start, expression.start + 8);
					} else {
						const newName = `svelte-${generator.parsed.hash}-${expression.name}`;
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

	generator.parsed.css.children.forEach(walkKeyframes);

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

	walkRules(generator.parsed.css.children, transform);

	if (!cascade) {
		generator.selectors.forEach(selector => {
			selector.transform(code, attr);
		});
	}

	// remove comments. TODO would be nice if this was exposed in css-tree
	let match;
	while ((match = commentsPattern.exec(css))) {
		const start = match.index + offset;
		const end = start + match[0].length;

		code.remove(start, end);
	}

	return code.slice(generator.parsed.css.content.start, generator.parsed.css.content.end);
}

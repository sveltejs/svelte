import attributeLookup from './lookup';
import deindent from '../../../../utils/deindent';
import { stringify } from '../../../../utils/stringify';
import getExpressionPrecedence from '../../../../utils/getExpressionPrecedence';
import getStaticAttributeValue from '../../../shared/getStaticAttributeValue';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

export interface StyleProp {
	key: string;
	value: Node[];
}

export default function visitStyleAttribute(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	attribute: Node,
	styleProps: StyleProp[]
) {
	styleProps.forEach((prop: StyleProp) => {
		let value;

		if (isDynamic(prop.value)) {
			const allDependencies = new Set();
			let shouldCache;
			let hasChangeableIndex;

			value =
				((prop.value.length === 1 || prop.value[0].type === 'Text') ? '' : `"" + `) +
				prop.value
					.map((chunk: Node) => {
						if (chunk.type === 'Text') {
							return stringify(chunk.data);
						} else {
							const { snippet, dependencies, indexes } = block.contextualise(chunk.expression);

							if (Array.from(indexes).some(index => block.changeableIndexes.get(index))) {
								hasChangeableIndex = true;
							}

							dependencies.forEach(d => {
								allDependencies.add(d);
							});

							return getExpressionPrecedence(chunk.expression) <= 13 ? `( ${snippet} )` : snippet;
						}
					})
					.join(' + ');

			if (allDependencies.size || hasChangeableIndex) {
				const dependencies = Array.from(allDependencies);
				const condition = (
					( block.hasOutroMethod ? `#outroing || ` : '' ) +
					dependencies.map(dependency => `changed.${dependency}`).join(' || ')
				);

				block.builders.update.addConditional(
					condition,
					`@setStyle(${node.var}, "${prop.key}", ${value});`
				);
			}
		} else {
			value = stringify(prop.value[0].data);
		}

		block.builders.hydrate.addLine(
			`@setStyle(${node.var}, "${prop.key}", ${value});`
		);
	});
}

export function optimizeStyle(value: Node[]) {
	let expectingKey = true;
	let i = 0;

	const props: { key: string, value: Node[] }[] = [];
	let chunks = value.slice();

	while (chunks.length) {
		const chunk = chunks[0];

		if (chunk.type !== 'Text') return null;

		const keyMatch = /^\s*([\w-]+):\s*/.exec(chunk.data);
		if (!keyMatch) return null;

		const key = keyMatch[1];

		const offset = keyMatch.index + keyMatch[0].length;
		const remainingData = chunk.data.slice(offset);

		if (remainingData) {
			chunks[0] = {
				start: chunk.start + offset,
				end: chunk.end,
				type: 'Text',
				data: remainingData
			};
		} else {
			chunks.shift();
		}

		const result = getStyleValue(chunks);
		if (!result) return null;

		props.push({ key, value: result.value });
		chunks = result.chunks;
	}

	return props;
}

function getStyleValue(chunks: Node[]) {
	const value: Node[] = [];

	let inUrl = false;
	let quoteMark = null;
	let escaped = false;

	while (chunks.length) {
		const chunk = chunks.shift();

		if (chunk.type === 'Text') {
			let c = 0;
			while (c < chunk.data.length) {
				const char = chunk.data[c];

				if (escaped) {
					escaped = false;
				} else if (char === '\\') {
					escaped = true;
				} else if (char === quoteMark) {
					quoteMark === null;
				} else if (char === '"' || char === "'") {
					quoteMark = char;
				} else if (char === ')' && inUrl) {
					inUrl = false;
				} else if (char === 'u' && chunk.data.slice(c, c + 4) === 'url(') {
					inUrl = true;
				} else if (char === ';' && !inUrl && !quoteMark) {
					break;
				}

				c += 1;
			}

			if (c > 0) {
				value.push({
					type: 'Text',
					start: chunk.start,
					end: chunk.start + c,
					data: chunk.data.slice(0, c)
				});
			}

			while (/[;\s]/.test(chunk.data[c])) c += 1;
			const remainingData = chunk.data.slice(c);

			if (remainingData) {
				chunks.unshift({
					start: chunk.start + c,
					end: chunk.end,
					type: 'Text',
					data: remainingData
				});

				break;
			}
		}

		else {
			value.push(chunk);
		}
	}

	return {
		chunks,
		value
	};
}

function isDynamic(value: Node[]) {
	return value.length > 1 || value[0].type !== 'Text';
}
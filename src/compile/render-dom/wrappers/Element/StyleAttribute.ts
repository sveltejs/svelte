import Attribute from '../../../nodes/Attribute';
import Block from '../../Block';
import AttributeWrapper from './Attribute';
import Node from '../../../nodes/shared/Node';
import ElementWrapper from '.';
import { stringify } from '../../../utils/stringify';
import add_to_set from '../../../utils/add_to_set';

export interface StyleProp {
	key: string;
	value: Node[];
}

export default class StyleAttributeWrapper extends AttributeWrapper {
	node: Attribute;
	parent: ElementWrapper;

	render(block: Block) {
		const style_props = optimize_style(this.node.chunks);

		style_props.forEach((prop: StyleProp) => {
			let value;

			if (is_dynamic(prop.value)) {
				const prop_dependencies = new Set();

				value =
					((prop.value.length === 1 || prop.value[0].type === 'Text') ? '' : `"" + `) +
					prop.value
						.map((chunk: Node) => {
							if (chunk.type === 'Text') {
								return stringify(chunk.data);
							} else {
								const snippet = chunk.render();

								add_to_set(prop_dependencies, chunk.dependencies);

								return chunk.get_precedence() <= 13 ? `(${snippet})` : snippet;
							}
						})
						.join(' + ');

				if (prop_dependencies.size) {
					const dependencies = Array.from(prop_dependencies);
					const condition = (
						(block.has_outros ? `!#current || ` : '') +
						dependencies.map(dependency => `changed.${dependency}`).join(' || ')
					);

					block.builders.update.add_conditional(
						condition,
						`@set_style(${this.parent.var}, "${prop.key}", ${value});`
					);
				}
			} else {
				value = stringify(prop.value[0].data);
			}

			block.builders.hydrate.add_line(
				`@set_style(${this.parent.var}, "${prop.key}", ${value});`
			);
		});
	}
}

function optimize_style(value: Node[]) {
	const props: { key: string, value: Node[] }[] = [];
	let chunks = value.slice();

	while (chunks.length) {
		const chunk = chunks[0];

		if (chunk.type !== 'Text') return null;

		const key_match = /^\s*([\w-]+):\s*/.exec(chunk.data);
		if (!key_match) return null;

		const key = key_match[1];

		const offset = key_match.index + key_match[0].length;
		const remaining_data = chunk.data.slice(offset);

		if (remaining_data) {
			chunks[0] = {
				start: chunk.start + offset,
				end: chunk.end,
				type: 'Text',
				data: remaining_data
			};
		} else {
			chunks.shift();
		}

		const result = get_style_value(chunks);

		props.push({ key, value: result.value });
		chunks = result.chunks;
	}

	return props;
}

function get_style_value(chunks: Node[]) {
	const value: Node[] = [];

	let in_url = false;
	let quote_mark = null;
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
				} else if (char === quote_mark) {
					quote_mark = null;
				} else if (char === '"' || char === "'") {
					quote_mark = char;
				} else if (char === ')' && in_url) {
					in_url = false;
				} else if (char === 'u' && chunk.data.slice(c, c + 4) === 'url(') {
					in_url = true;
				} else if (char === ';' && !in_url && !quote_mark) {
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
			const remaining_data = chunk.data.slice(c);

			if (remaining_data) {
				chunks.unshift({
					start: chunk.start + c,
					end: chunk.end,
					type: 'Text',
					data: remaining_data
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

function is_dynamic(value: Node[]) {
	return value.length > 1 || value[0].type !== 'Text';
}

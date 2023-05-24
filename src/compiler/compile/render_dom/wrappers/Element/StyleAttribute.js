import { b, x } from 'code-red';
import AttributeWrapper from './Attribute.js';
import { string_literal } from '../../../utils/stringify.js';
import add_to_set from '../../../utils/add_to_set.js';

/** @extends AttributeWrapper */
export default class StyleAttributeWrapper extends AttributeWrapper {
	/** @param {import('../../Block.js').default} block */
	render(block) {
		const style_props = optimize_style(this.node.chunks);
		if (!style_props) return super.render(block);
		style_props.forEach((prop) => {
			let value;
			if (is_dynamic(prop.value)) {
				const prop_dependencies = new Set();
				value = prop.value
					.map((chunk) => {
						if (chunk.type === 'Text') {
							return string_literal(chunk.data);
						} else {
							add_to_set(prop_dependencies, chunk.dynamic_dependencies());
							return chunk.manipulate(block);
						}
					})
					.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
				// TODO is this necessary? style.setProperty always treats value as string, no?
				// if (prop.value.length === 1 || prop.value[0].type !== 'Text') {
				// 	value = x`"" + ${value}`;
				// }
				if (prop_dependencies.size) {
					let condition = block.renderer.dirty(Array.from(prop_dependencies));
					if (block.has_outros) {
						condition = x`!#current || ${condition}`;
					}
					const update = b`
						if (${condition}) {
							@set_style(${this.parent.var}, "${prop.key}", ${value}, ${prop.important ? 1 : null});
						}`;
					block.chunks.update.push(update);
				}
			} else {
				value = string_literal(
					/** @type {import('../../../nodes/Text.js').default} */ (prop.value[0]).data
				);
			}
			block.chunks.hydrate.push(
				b`@set_style(${this.parent.var}, "${prop.key}", ${value}, ${prop.important ? 1 : null});`
			);
		});
	}
}
const regex_style_prop_key = /^\s*([\w-]+):\s*/;

/** @param {Array<import('../../../nodes/Text.js').default | import('../../../nodes/shared/Expression.js').default>} value */
function optimize_style(value) {
	/** @type {Array<{ key: string; value: Array<import('../../../nodes/Text.js').default | import('../../../nodes/shared/Expression.js').default>; important: boolean; }>} */
	const props = [];
	let chunks = value.slice();
	while (chunks.length) {
		const chunk = chunks[0];
		if (chunk.type !== 'Text') return null;
		const key_match = regex_style_prop_key.exec(chunk.data);
		if (!key_match) return null;
		const key = key_match[1];
		const offset = key_match.index + key_match[0].length;
		const remaining_data = chunk.data.slice(offset);
		if (remaining_data) {
			chunks[0] = /** @type {import('../../../nodes/Text.js').default} */ ({
				start: chunk.start + offset,
				end: chunk.end,
				type: 'Text',
				data: remaining_data
			});
		} else {
			chunks.shift();
		}
		const result = get_style_value(chunks);
		props.push({ key, value: result.value, important: result.important });
		chunks = result.chunks;
	}
	return props;
}
const regex_important_flag = /\s*!important\s*$/;
const regex_semicolon_or_whitespace = /[;\s]/;

/** @param {Array<import('../../../nodes/Text.js').default | import('../../../nodes/shared/Expression.js').default>} chunks */
function get_style_value(chunks) {
	/** @type {Array<import('../../../nodes/Text.js').default | import('../../../nodes/shared/Expression.js').default>} */
	const value = [];
	let in_url = false;
	let quote_mark = null;
	let escaped = false;
	let closed = false;
	while (chunks.length && !closed) {
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
					closed = true;
					break;
				}
				c += 1;
			}
			if (c > 0) {
				value.push(
					/** @type {import('../../../nodes/Text.js').default} */ ({
						type: 'Text',
						start: chunk.start,
						end: chunk.start + c,
						data: chunk.data.slice(0, c)
					})
				);
			}
			while (regex_semicolon_or_whitespace.test(chunk.data[c])) c += 1;
			const remaining_data = chunk.data.slice(c);
			if (remaining_data) {
				chunks.unshift(
					/** @type {import('../../../nodes/Text.js').default} */ ({
						start: chunk.start + c,
						end: chunk.end,
						type: 'Text',
						data: remaining_data
					})
				);
				break;
			}
		} else {
			value.push(chunk);
		}
	}
	let important = false;
	const last_chunk = value[value.length - 1];
	if (last_chunk && last_chunk.type === 'Text' && regex_important_flag.test(last_chunk.data)) {
		important = true;
		last_chunk.data = last_chunk.data.replace(regex_important_flag, '');
		if (!last_chunk.data) value.pop();
	}
	return {
		chunks,
		value,
		important
	};
}

/** @param {Array<import('../../../nodes/Text.js').default | import('../../../nodes/shared/Expression.js').default>} value */
function is_dynamic(value) {
	return value.length > 1 || value[0].type !== 'Text';
}

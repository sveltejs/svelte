import Attribute from '../../../nodes/Attribute';
import Block from '../../Block';
import fix_attribute_casing from './fix_attribute_casing';
import ElementWrapper from './index';
import { stringify } from '../../../utils/stringify';
import deindent from '../../../utils/deindent';
import Expression from '../../../nodes/shared/Expression';
import Text from '../../../nodes/Text';

export default class AttributeWrapper {
	node: Attribute;
	parent: ElementWrapper;

	constructor(parent: ElementWrapper, block: Block, node: Attribute) {
		this.node = node;
		this.parent = parent;

		if (node.dependencies.size > 0) {
			parent.cannot_use_innerhtml();

			block.add_dependencies(node.dependencies);

			// special case — <option value={foo}> — see below
			if (this.parent.node.name === 'option' && node.name === 'value') {
				let select: ElementWrapper = this.parent;
				while (select && (select.node.type !== 'Element' || select.node.name !== 'select'))
					// @ts-ignore todo: doublecheck this, but looks to be correct
					select = select.parent;

				if (select && select.select_binding_dependencies) {
					select.select_binding_dependencies.forEach(prop => {
						this.node.dependencies.forEach((dependency: string) => {
							this.parent.renderer.component.indirect_dependencies.get(prop).add(dependency);
						});
					});
				}
			}
		}
	}

	render(block: Block) {
		const element = this.parent;
		const name = fix_attribute_casing(this.node.name);

		let metadata = element.node.namespace ? null : attribute_lookup[name];
		if (metadata && metadata.applies_to && !~metadata.applies_to.indexOf(element.node.name))
			metadata = null;

		const is_indirectly_bound_value =
			name === 'value' &&
			(element.node.name === 'option' || // TODO check it's actually bound
				(element.node.name === 'input' &&
					element.node.bindings.find(
						(binding) =>
							/checked|group/.test(binding.name)
					)));

		const property_name = is_indirectly_bound_value
			? '__value'
			: metadata && metadata.property_name;

		// xlink is a special case... we could maybe extend this to generic
		// namespaced attributes but I'm not sure that's applicable in
		// HTML5?
		const method = /-/.test(element.node.name)
			? '@set_custom_element_data'
			: name.slice(0, 6) === 'xlink:'
				? '@xlink_attr'
				: '@attr';

		const is_legacy_input_type = element.renderer.component.compile_options.legacy && name === 'type' && this.parent.node.name === 'input';

		const is_dataset = /^data-/.test(name) && !element.renderer.component.compile_options.legacy && !element.node.namespace;
		const camel_case_name = is_dataset ? name.replace('data-', '').replace(/(-\w)/g, (m) => {
			return m[1].toUpperCase();
		}) : name;

		if (this.node.is_dynamic) {
			let value;

			// TODO some of this code is repeated in Tag.ts — would be good to
			// DRY it out if that's possible without introducing crazy indirection
			if (this.node.chunks.length === 1) {
				// single {tag} — may be a non-string
				value = (this.node.chunks[0] as Expression).render(block);
			} else {
				// '{foo} {bar}' — treat as string concatenation
				const prefix = this.node.chunks[0].type === 'Text' ? '' : `"" + `;

				const text = this.node.name === 'class'
					? this.get_class_name_text()
					: this.render_chunks().join(' + ');

				value = `${prefix}${text}`;
			}

			const is_select_value_attribute =
				name === 'value' && element.node.name === 'select';

			const should_cache = (this.node.should_cache || is_select_value_attribute);

			const last = should_cache && block.get_unique_name(
				`${element.var}_${name.replace(/[^a-zA-Z_$]/g, '_')}_value`
			);

			if (should_cache) block.add_variable(last);

			let updater;
			const init = should_cache ? `${last} = ${value}` : value;

			if (is_legacy_input_type) {
				block.builders.hydrate.add_line(
					`@set_input_type(${element.var}, ${init});`
				);
				updater = `@set_input_type(${element.var}, ${should_cache ? last : value});`;
			} else if (is_select_value_attribute) {
				// annoying special case
				const is_multiple_select = element.node.get_static_attribute_value('multiple');
				const i = block.get_unique_name('i');
				const option = block.get_unique_name('option');

				const if_statement = is_multiple_select
					? deindent`
						${option}.selected = ~${last}.indexOf(${option}.__value);`
					: deindent`
						if (${option}.__value === ${last}) {
							${option}.selected = true;
							break;
						}`;

				updater = deindent`
					for (var ${i} = 0; ${i} < ${element.var}.options.length; ${i} += 1) {
						var ${option} = ${element.var}.options[${i}];

						${if_statement}
					}
				`;

				block.builders.mount.add_block(deindent`
					${last} = ${value};
					${updater}
				`);
			} else if (property_name) {
				block.builders.hydrate.add_line(
					`${element.var}.${property_name} = ${init};`
				);
				updater = `${element.var}.${property_name} = ${should_cache ? last : value};`;
			} else if (is_dataset) {
				block.builders.hydrate.add_line(
					`${element.var}.dataset.${camel_case_name} = ${init};`
				);
				updater = `${element.var}.dataset.${camel_case_name} = ${should_cache ? last : value};`;
			} else {
				block.builders.hydrate.add_line(
					`${method}(${element.var}, "${name}", ${init});`
				);
				updater = `${method}(${element.var}, "${name}", ${should_cache ? last : value});`;
			}

			// only add an update if mutations are involved (or it's a select?)
			const dependencies = this.node.get_dependencies();
			if (dependencies.length > 0 || is_select_value_attribute) {
				const changed_check = (
					(block.has_outros ? `!#current || ` : '') +
					dependencies.map(dependency => `changed.${dependency}`).join(' || ')
				);

				const update_cached_value = `${last} !== (${last} = ${value})`;

				const condition = should_cache
					? (dependencies.length ? `(${changed_check}) && ${update_cached_value}` : update_cached_value)
					: changed_check;

				block.builders.update.add_conditional(
					condition,
					updater
				);
			}
		} else {
			const value = this.node.get_value(block);

			const statement = (
				is_legacy_input_type
					? `@set_input_type(${element.var}, ${value});`
					: property_name
						? `${element.var}.${property_name} = ${value};`
						: is_dataset
							? `${element.var}.dataset.${camel_case_name} = ${value === true ? '""' : value};`
							: `${method}(${element.var}, "${name}", ${value === true ? '""' : value});`
			);

			block.builders.hydrate.add_line(statement);

			// special case – autofocus. has to be handled in a bit of a weird way
			if (this.node.is_true && name === 'autofocus') {
				block.autofocus = element.var;
			}
		}

		if (is_indirectly_bound_value) {
			const update_value = `${element.var}.value = ${element.var}.__value;`;

			block.builders.hydrate.add_line(update_value);
			if (this.node.is_dynamic) block.builders.update.add_line(update_value);
		}
	}

	get_class_name_text() {
		const scoped_css = this.node.chunks.some((chunk: Text) => chunk.synthetic);
		const rendered = this.render_chunks();

		if (scoped_css && rendered.length === 2) {
			// we have a situation like class={possiblyUndefined}
			rendered[0] = `@null_to_empty(${rendered[0]})`;
		}

		return rendered.join(' + ');
	}

	render_chunks() {
		return this.node.chunks.map((chunk) => {
			if (chunk.type === 'Text') {
				return stringify(chunk.data);
			}

			const rendered = chunk.render();
			return chunk.get_precedence() <= 13
				? `(${rendered})`
				: rendered;
		});
	}

	stringify() {
		if (this.node.is_true) return '';

		const value = this.node.chunks;
		if (value.length === 0) return `=""`;

		return `="${value.map(chunk => {
			return chunk.type === 'Text'
				? chunk.data.replace(/"/g, '\\"')
				: `\${${chunk.render()}}`;
		})}"`;
	}
}

// source: https://html.spec.whatwg.org/multipage/indices.html
const attribute_lookup = {
	allowfullscreen: { property_name: 'allowFullscreen', applies_to: ['iframe'] },
	allowpaymentrequest: { property_name: 'allowPaymentRequest', applies_to: ['iframe'] },
	async: { applies_to: ['script'] },
	autofocus: { applies_to: ['button', 'input', 'keygen', 'select', 'textarea'] },
	autoplay: { applies_to: ['audio', 'video'] },
	checked: { applies_to: ['input'] },
	controls: { applies_to: ['audio', 'video'] },
	default: { applies_to: ['track'] },
	defer: { applies_to: ['script'] },
	disabled: {
		applies_to: [
			'button',
			'fieldset',
			'input',
			'keygen',
			'optgroup',
			'option',
			'select',
			'textarea',
		],
	},
	formnovalidate: { property_name: 'formNoValidate', applies_to: ['button', 'input'] },
	hidden: {},
	indeterminate: { applies_to: ['input'] },
	ismap: { property_name: 'isMap', applies_to: ['img'] },
	loop: { applies_to: ['audio', 'bgsound', 'video'] },
	multiple: { applies_to: ['input', 'select'] },
	muted: { applies_to: ['audio', 'video'] },
	nomodule: { property_name: 'noModule', applies_to: ['script'] },
	novalidate: { property_name: 'noValidate', applies_to: ['form'] },
	open: { applies_to: ['details', 'dialog'] },
	playsinline: { property_name: 'playsInline', applies_to: ['video'] },
	readonly: { property_name: 'readOnly', applies_to: ['input', 'textarea'] },
	required: { applies_to: ['input', 'select', 'textarea'] },
	reversed: { applies_to: ['ol'] },
	selected: { applies_to: ['option'] },
	value: {
		applies_to: [
			'button',
			'option',
			'input',
			'li',
			'meter',
			'progress',
			'param',
			'select',
			'textarea',
		],
	},
};

Object.keys(attribute_lookup).forEach(name => {
	const metadata = attribute_lookup[name];
	if (!metadata.property_name) metadata.property_name = name;
});

import Attribute from '../../../nodes/Attribute';
import Block from '../../Block';
import fix_attribute_casing from './fix_attribute_casing';
import ElementWrapper from './index';
import { string_literal } from '../../../utils/stringify';
import { b, x } from 'code-red';
import Expression from '../../../nodes/shared/Expression';
import Text from '../../../nodes/Text';
import handle_select_value_binding from './handle_select_value_binding';
import { Identifier, Node } from 'estree';
import { namespaces } from '../../../../utils/namespaces';

export class BaseAttributeWrapper {
	node: Attribute;
	parent: ElementWrapper;

	constructor(parent: ElementWrapper, block: Block, node: Attribute) {
		this.node = node;
		this.parent = parent;

		if (node.dependencies.size > 0) {
			parent.cannot_use_innerhtml();
			parent.not_static_content();

			block.add_dependencies(node.dependencies);
		}
	}

	render(_block: Block) {}
}

export default class AttributeWrapper extends BaseAttributeWrapper {
	node: Attribute;
	parent: ElementWrapper;
	metadata: any;
	name: string;
	property_name: string;
	is_indirectly_bound_value: boolean;
	is_src: boolean;
	is_select_value_attribute: boolean;
	is_input_value: boolean;
	should_cache: boolean;
	last: Identifier;

	constructor(parent: ElementWrapper, block: Block, node: Attribute) {
		super(parent, block, node);

		if (node.dependencies.size > 0) {
			// special case — <option value={foo}> — see below
			if (this.parent.node.name === 'option' && node.name === 'value') {
				let select: ElementWrapper = this.parent;
				while (select && (select.node.type !== 'Element' || select.node.name !== 'select')) {
					// @ts-ignore todo: doublecheck this, but looks to be correct
					select = select.parent;
				}

				if (select && select.select_binding_dependencies) {
					select.select_binding_dependencies.forEach(prop => {
						this.node.dependencies.forEach((dependency: string) => {
							this.parent.renderer.component.indirect_dependencies.get(prop).add(dependency);
						});
					});
				}
			}

			if (node.name === 'value') {
				handle_select_value_binding(this, node.dependencies);
			}
		}

		if (this.parent.node.namespace == namespaces.foreign) {
			// leave attribute case alone for elements in the "foreign" namespace
			this.name = this.node.name;
			this.metadata = this.get_metadata();
			this.is_indirectly_bound_value = false;
			this.property_name = null;
			this.is_select_value_attribute = false;
			this.is_input_value = false;
		} else {
			this.name = fix_attribute_casing(this.node.name);
			this.metadata = this.get_metadata();
			this.is_indirectly_bound_value = is_indirectly_bound_value(this);
			this.property_name = this.is_indirectly_bound_value
				? '__value'
				: this.metadata && this.metadata.property_name;
			this.is_select_value_attribute = this.name === 'value' && this.parent.node.name === 'select';
			this.is_input_value = this.name === 'value' && this.parent.node.name === 'input';
		}
		
		this.is_src = this.name === 'src'; // TODO retire this exception in favour of https://github.com/sveltejs/svelte/issues/3750
		this.should_cache = should_cache(this);
	}

	render(block: Block) {
		const element = this.parent;
		const { name, property_name, should_cache, is_indirectly_bound_value } = this;

		// xlink is a special case... we could maybe extend this to generic
		// namespaced attributes but I'm not sure that's applicable in
		// HTML5?
		const method = /-/.test(element.node.name)
			? '@set_custom_element_data'
			: name.slice(0, 6) === 'xlink:'
				? '@xlink_attr'
				: '@attr';

		const is_legacy_input_type = element.renderer.component.compile_options.legacy && name === 'type' && this.parent.node.name === 'input';

		const dependencies = this.get_dependencies();
		const value = this.get_value(block);

		let updater;
		const init = this.get_init(block, value);

		if (is_legacy_input_type) {
			block.chunks.hydrate.push(
				b`@set_input_type(${element.var}, ${init});`
			);
			updater = b`@set_input_type(${element.var}, ${should_cache ? this.last : value});`;
		} else if (this.is_select_value_attribute) {
			// annoying special case
			const is_multiple_select = element.node.get_static_attribute_value('multiple');

			if (is_multiple_select) {
				updater = b`@select_options(${element.var}, ${value});`;
			} else {
				updater = b`@select_option(${element.var}, ${value});`;
			}

			block.chunks.mount.push(b`
				${updater}
			`);
		} else if (this.is_src) {
			block.chunks.hydrate.push(
				b`if (!@src_url_equal(${element.var}.src, ${init})) ${method}(${element.var}, "${name}", ${this.last});`
			);
			updater = b`${method}(${element.var}, "${name}", ${should_cache ? this.last : value});`;
		} else if (property_name) {
			block.chunks.hydrate.push(
				b`${element.var}.${property_name} = ${init};`
			);
			updater = block.renderer.options.dev
				? b`@prop_dev(${element.var}, "${property_name}", ${should_cache ? this.last : value});`
				: b`${element.var}.${property_name} = ${should_cache ? this.last : value};`;
		} else {
			block.chunks.hydrate.push(
				b`${method}(${element.var}, "${name}", ${init});`
			);
			updater = b`${method}(${element.var}, "${name}", ${should_cache ? this.last : value});`;
		}

		if (is_indirectly_bound_value) {
			const update_value = b`${element.var}.value = ${element.var}.__value;`;
			block.chunks.hydrate.push(update_value);

			updater = b`
				${updater}
				${update_value};
			`;
		}

		if (dependencies.length > 0) {
			const condition = this.get_dom_update_conditions(block, block.renderer.dirty(dependencies));

			block.chunks.update.push(b`
				if (${condition}) {
					${updater}
				}`);
		}

		// special case – autofocus. has to be handled in a bit of a weird way
		if (this.node.is_true && name === 'autofocus') {
			block.autofocus = element.var;
		}
	}

	get_init(block: Block, value) {
		this.last = this.should_cache && block.get_unique_name(
			`${this.parent.var.name}_${this.name.replace(/[^a-zA-Z_$]/g, '_')}_value`
		);

		if (this.should_cache) block.add_variable(this.last);

		return this.should_cache ? x`${this.last} = ${value}` : value;
	}

	get_dom_update_conditions(block: Block, dependency_condition: Node) {
		const { property_name, should_cache, last } = this;
		const element = this.parent;
		const value = this.get_value(block);

		let condition = dependency_condition;

		if (should_cache) {
			condition = this.is_src
				? x`${condition} && (!@src_url_equal(${element.var}.src, (${last} = ${value})))`
				: x`${condition} && (${last} !== (${last} = ${value}))`;
		}

		if (this.is_input_value) {
			const type = element.node.get_static_attribute_value('type');

			if (type === null || type === '' || type === 'text' || type === 'email' || type === 'password') {
				condition = x`${condition} && ${element.var}.${property_name} !== ${should_cache ? last : value}`;
			}
		}

		if (block.has_outros) {
			condition = x`!#current || ${condition}`;
		}

		return condition;
	}

	get_dependencies() {
		const node_dependencies = this.node.get_dependencies();
		const dependencies = new Set(node_dependencies);

		node_dependencies.forEach((prop: string) => {
			const indirect_dependencies = this.parent.renderer.component.indirect_dependencies.get(prop);
			if (indirect_dependencies) {
				indirect_dependencies.forEach(indirect_dependency => {
					dependencies.add(indirect_dependency);
				});
			}
		});

		return Array.from(dependencies);
	}

	get_metadata() {
		if (this.parent.node.namespace) return null;
		const metadata = attribute_lookup[this.name];
		if (metadata && metadata.applies_to && !metadata.applies_to.includes(this.parent.node.name)) return null;
		return metadata;
	}

	get_value(block) {
		if (this.node.is_true) {
			if (this.metadata && boolean_attribute.has(this.metadata.property_name.toLowerCase())) {
				return x`true`;
			}
			return x`""`;
		}
		if (this.node.chunks.length === 0) return x`""`;

		// TODO some of this code is repeated in Tag.ts — would be good to
		// DRY it out if that's possible without introducing crazy indirection
		if (this.node.chunks.length === 1) {
			return this.node.chunks[0].type === 'Text'
				? string_literal((this.node.chunks[0] as Text).data)
				: (this.node.chunks[0] as Expression).manipulate(block);
		}

		let value = this.node.name === 'class'
			? this.get_class_name_text(block)
			: this.render_chunks(block).reduce((lhs, rhs) => x`${lhs} + ${rhs}`);

		// '{foo} {bar}' — treat as string concatenation
		if (this.node.chunks[0].type !== 'Text') {
			value = x`"" + ${value}`;
		}

		return value;
	}

	get_class_name_text(block) {
		const scoped_css = this.node.chunks.some((chunk: Text) => chunk.synthetic);
		const rendered = this.render_chunks(block);

		if (scoped_css && rendered.length === 2) {
			// we have a situation like class={possiblyUndefined}
			rendered[0] = x`@null_to_empty(${rendered[0]})`;
		}

		return rendered.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
	}

	render_chunks(block: Block) {
		return this.node.chunks.map((chunk) => {
			if (chunk.type === 'Text') {
				return string_literal(chunk.data);
			}

			return chunk.manipulate(block);
		});
	}

	stringify() {
		if (this.node.is_true) return '';

		const value = this.node.chunks;
		if (value.length === 0) return '=""';

		return `="${value.map(chunk => {
			return chunk.type === 'Text'
				? chunk.data.replace(/"/g, '\\"')
				: `\${${chunk.manipulate()}}`;
		}).join('')}"`;
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
			'textarea'
		]
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
			'textarea'
		]
	}
};

Object.keys(attribute_lookup).forEach(name => {
	const metadata = attribute_lookup[name];
	if (!metadata.property_name) metadata.property_name = name;
});

// source: https://html.spec.whatwg.org/multipage/indices.html
const boolean_attribute = new Set([
	'allowfullscreen',
	'allowpaymentrequest',
	'async',
	'autofocus',
	'autoplay',
	'checked',
	'controls',
	'default',
	'defer',
	'disabled',
	'formnovalidate',
	'hidden',
	'ismap',
	'itemscope',
	'loop',
	'multiple',
	'muted',
	'nomodule',
	'novalidate',
	'open',
	'playsinline',
	'readonly',
	'required',
	'reversed',
	'selected'
]);

function should_cache(attribute: AttributeWrapper) {
	return attribute.is_src || attribute.node.should_cache();
}

function is_indirectly_bound_value(attribute: AttributeWrapper) {
	const element = attribute.parent;
	return attribute.name === 'value' &&
		(element.node.name === 'option' || // TODO check it's actually bound
			(element.node.name === 'input' &&
				element.node.bindings.some(
					(binding) =>
						/checked|group/.test(binding.name)
				)));
}

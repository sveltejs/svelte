import Attribute from '../../../nodes/Attribute';
import Block from '../../Block';
import fix_attribute_casing from './fix_attribute_casing';
import ElementWrapper from './index';
import { stringify } from '../../../utils/stringify';
import deindent from '../../../utils/deindent';

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
				while (select && (select.node.type !== 'Element' || select.node.name !== 'select')) select = select.parent;

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
						(binding: Binding) =>
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
		const camel_case_name = is_dataset ? name.replace('data-', '').replace(/(-\w)/g, function (m) {
			return m[1].toUpperCase();
		}) : name;

		if (this.node.is_dynamic) {
			let value;

			// TODO some of this code is repeated in Tag.ts — would be good to
			// DRY it out if that's possible without introducing crazy indirection
			if (this.node.chunks.length === 1) {
				// single {tag} — may be a non-string
				value = this.node.chunks[0].render();
			} else {
				// '{foo} {bar}' — treat as string concatenation
				value =
					(this.node.chunks[0].type === 'Text' ? '' : `"" + `) +
					this.node.chunks
						.map((chunk: Node) => {
							if (chunk.type === 'Text') {
								return stringify(chunk.data);
							} else {
								return chunk.get_precedence() <= 13
									? `(${chunk.render()})`
									: chunk.render();
							}
						})
						.join(' + ');
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
							? `${element.var}.dataset.${camel_case_name} = ${value};`
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

	stringify() {
		if (this.node.is_true) return '';

		const value = this.node.chunks;
		if (value.length === 0) return `=""`;

		return `="${value.map(chunk => {
			return chunk.type === 'Text'
				? chunk.data.replace(/"/g, '\\"')
				: `\${${chunk.render()}}`
		})}"`;
	}
}

// source: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
const attribute_lookup = {
	accept: { applies_to: ['form', 'input'] },
	'accept-charset': { property_name: 'acceptCharset', applies_to: ['form'] },
	accesskey: { property_name: 'accessKey' },
	action: { applies_to: ['form'] },
	align: {
		applies_to: [
			'applet',
			'caption',
			'col',
			'colgroup',
			'hr',
			'iframe',
			'img',
			'table',
			'tbody',
			'td',
			'tfoot',
			'th',
			'thead',
			'tr',
		],
	},
	allowfullscreen: { property_name: 'allowFullscreen', applies_to: ['iframe'] },
	alt: { applies_to: ['applet', 'area', 'img', 'input'] },
	async: { applies_to: ['script'] },
	autocomplete: { applies_to: ['form', 'input'] },
	autofocus: { applies_to: ['button', 'input', 'keygen', 'select', 'textarea'] },
	autoplay: { applies_to: ['audio', 'video'] },
	autosave: { applies_to: ['input'] },
	bgcolor: {
		property_name: 'bgColor',
		applies_to: [
			'body',
			'col',
			'colgroup',
			'marquee',
			'table',
			'tbody',
			'tfoot',
			'td',
			'th',
			'tr',
		],
	},
	border: { applies_to: ['img', 'object', 'table'] },
	buffered: { applies_to: ['audio', 'video'] },
	challenge: { applies_to: ['keygen'] },
	charset: { applies_to: ['meta', 'script'] },
	checked: { applies_to: ['command', 'input'] },
	cite: { applies_to: ['blockquote', 'del', 'ins', 'q'] },
	class: { property_name: 'className' },
	code: { applies_to: ['applet'] },
	codebase: { property_name: 'codeBase', applies_to: ['applet'] },
	color: { applies_to: ['basefont', 'font', 'hr'] },
	cols: { applies_to: ['textarea'] },
	colspan: { property_name: 'colSpan', applies_to: ['td', 'th'] },
	content: { applies_to: ['meta'] },
	contenteditable: { property_name: 'contentEditable' },
	contextmenu: {},
	controls: { applies_to: ['audio', 'video'] },
	coords: { applies_to: ['area'] },
	data: { applies_to: ['object'] },
	datetime: { property_name: 'dateTime', applies_to: ['del', 'ins', 'time'] },
	default: { applies_to: ['track'] },
	defer: { applies_to: ['script'] },
	dir: {},
	dirname: { property_name: 'dirName', applies_to: ['input', 'textarea'] },
	disabled: {
		applies_to: [
			'button',
			'command',
			'fieldset',
			'input',
			'keygen',
			'optgroup',
			'option',
			'select',
			'textarea',
		],
	},
	download: { applies_to: ['a', 'area'] },
	draggable: {},
	dropzone: {},
	enctype: { applies_to: ['form'] },
	for: { property_name: 'htmlFor', applies_to: ['label', 'output'] },
	form: {
		applies_to: [
			'button',
			'fieldset',
			'input',
			'keygen',
			'label',
			'meter',
			'object',
			'output',
			'progress',
			'select',
			'textarea',
		],
	},
	formaction: { applies_to: ['input', 'button'] },
	headers: { applies_to: ['td', 'th'] },
	height: {
		applies_to: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'video'],
	},
	hidden: {},
	high: { applies_to: ['meter'] },
	href: { applies_to: ['a', 'area', 'base', 'link'] },
	hreflang: { applies_to: ['a', 'area', 'link'] },
	'http-equiv': { property_name: 'httpEquiv', applies_to: ['meta'] },
	icon: { applies_to: ['command'] },
	id: {},
	indeterminate: { applies_to: ['input'] },
	ismap: { property_name: 'isMap', applies_to: ['img'] },
	itemprop: {},
	keytype: { applies_to: ['keygen'] },
	kind: { applies_to: ['track'] },
	label: { applies_to: ['track'] },
	lang: {},
	language: { applies_to: ['script'] },
	loop: { applies_to: ['audio', 'bgsound', 'marquee', 'video'] },
	low: { applies_to: ['meter'] },
	manifest: { applies_to: ['html'] },
	max: { applies_to: ['input', 'meter', 'progress'] },
	maxlength: { property_name: 'maxLength', applies_to: ['input', 'textarea'] },
	media: { applies_to: ['a', 'area', 'link', 'source', 'style'] },
	method: { applies_to: ['form'] },
	min: { applies_to: ['input', 'meter'] },
	multiple: { applies_to: ['input', 'select'] },
	muted: { applies_to: ['audio', 'video'] },
	name: {
		applies_to: [
			'button',
			'form',
			'fieldset',
			'iframe',
			'input',
			'keygen',
			'object',
			'output',
			'select',
			'textarea',
			'map',
			'meta',
			'param',
		],
	},
	novalidate: { property_name: 'noValidate', applies_to: ['form'] },
	open: { applies_to: ['details'] },
	optimum: { applies_to: ['meter'] },
	pattern: { applies_to: ['input'] },
	ping: { applies_to: ['a', 'area'] },
	placeholder: { applies_to: ['input', 'textarea'] },
	poster: { applies_to: ['video'] },
	preload: { applies_to: ['audio', 'video'] },
	radiogroup: { applies_to: ['command'] },
	readonly: { property_name: 'readOnly', applies_to: ['input', 'textarea'] },
	rel: { applies_to: ['a', 'area', 'link'] },
	required: { applies_to: ['input', 'select', 'textarea'] },
	reversed: { applies_to: ['ol'] },
	rows: { applies_to: ['textarea'] },
	rowspan: { property_name: 'rowSpan', applies_to: ['td', 'th'] },
	sandbox: { applies_to: ['iframe'] },
	scope: { applies_to: ['th'] },
	scoped: { applies_to: ['style'] },
	seamless: { applies_to: ['iframe'] },
	selected: { applies_to: ['option'] },
	shape: { applies_to: ['a', 'area'] },
	size: { applies_to: ['input', 'select'] },
	sizes: { applies_to: ['link', 'img', 'source'] },
	span: { applies_to: ['col', 'colgroup'] },
	spellcheck: {},
	src: {
		applies_to: [
			'audio',
			'embed',
			'iframe',
			'img',
			'input',
			'script',
			'source',
			'track',
			'video',
		],
	},
	srcdoc: { applies_to: ['iframe'] },
	srclang: { applies_to: ['track'] },
	srcset: { applies_to: ['img'] },
	start: { applies_to: ['ol'] },
	step: { applies_to: ['input'] },
	style: { property_name: 'style.cssText' },
	summary: { applies_to: ['table'] },
	tabindex: { property_name: 'tabIndex' },
	target: { applies_to: ['a', 'area', 'base', 'form'] },
	title: {},
	type: {
		applies_to: [
			'button',
			'command',
			'embed',
			'object',
			'script',
			'source',
			'style',
			'menu',
		],
	},
	usemap: { property_name: 'useMap', applies_to: ['img', 'input', 'object'] },
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
	volume: { applies_to: ['audio', 'video'] },
	playbackRate: { applies_to: ['audio', 'video'] },
	width: {
		applies_to: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'video'],
	},
	wrap: { applies_to: ['textarea'] },
};

Object.keys(attribute_lookup).forEach(name => {
	const metadata = attribute_lookup[name];
	if (!metadata.property_name) metadata.property_name = name;
});

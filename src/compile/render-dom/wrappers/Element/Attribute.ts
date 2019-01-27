import Attribute from '../../../nodes/Attribute';
import Block from '../../Block';
import fixAttributeCasing from '../../../../utils/fixAttributeCasing';
import ElementWrapper from './index';
import { stringify } from '../../../../utils/stringify';
import deindent from '../../../../utils/deindent';

export default class AttributeWrapper {
	node: Attribute;
	parent: ElementWrapper;

	constructor(parent: ElementWrapper, block: Block, node: Attribute) {
		this.node = node;
		this.parent = parent;

		if (node.dependencies.size > 0) {
			parent.cannotUseInnerHTML();

			block.addDependencies(node.dependencies);

			// special case — <option value={foo}> — see below
			if (this.parent.node.name === 'option' && node.name === 'value') {
				let select: ElementWrapper = this.parent;
				while (select && (select.node.type !== 'Element' || select.node.name !== 'select')) select = select.parent;

				if (select && select.selectBindingDependencies) {
					select.selectBindingDependencies.forEach(prop => {
						this.node.dependencies.forEach((dependency: string) => {
							this.parent.renderer.component.indirectDependencies.get(prop).add(dependency);
						});
					});
				}
			}
		}
	}

	render(block: Block) {
		const element = this.parent;
		const name = fixAttributeCasing(this.node.name);

		let metadata = element.node.namespace ? null : attributeLookup[name];
		if (metadata && metadata.appliesTo && !~metadata.appliesTo.indexOf(element.node.name))
			metadata = null;

		const isIndirectlyBoundValue =
			name === 'value' &&
			(element.node.name === 'option' || // TODO check it's actually bound
				(element.node.name === 'input' &&
					element.node.bindings.find(
						(binding: Binding) =>
							/checked|group/.test(binding.name)
						)));

		const propertyName = isIndirectlyBoundValue
			? '__value'
			: metadata && metadata.propertyName;

		// xlink is a special case... we could maybe extend this to generic
		// namespaced attributes but I'm not sure that's applicable in
		// HTML5?
		const method = /-/.test(element.node.name)
			? '@setCustomElementData'
			: name.slice(0, 6) === 'xlink:'
				? '@setXlinkAttribute'
				: '@setAttribute';

		const isLegacyInputType = element.renderer.component.options.legacy && name === 'type' && this.parent.node.name === 'input';

		const isDataSet = /^data-/.test(name) && !element.renderer.component.options.legacy && !element.node.namespace;
		const camelCaseName = isDataSet ? name.replace('data-', '').replace(/(-\w)/g, function (m) {
			return m[1].toUpperCase();
		}) : name;

		if (this.node.isDynamic) {
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
								return chunk.getPrecedence() <= 13
									? `(${chunk.render()})`
									: chunk.render();
							}
						})
						.join(' + ');
			}

			const isSelectValueAttribute =
				name === 'value' && element.node.name === 'select';

			const shouldCache = (this.node.shouldCache || isSelectValueAttribute);

			const last = shouldCache && block.getUniqueName(
				`${element.var}_${name.replace(/[^a-zA-Z_$]/g, '_')}_value`
			);

			if (shouldCache) block.addVariable(last);

			let updater;
			const init = shouldCache ? `${last} = ${value}` : value;

			if (isLegacyInputType) {
				block.builders.hydrate.addLine(
					`@setInputType(${element.var}, ${init});`
				);
				updater = `@setInputType(${element.var}, ${shouldCache ? last : value});`;
			} else if (isSelectValueAttribute) {
				// annoying special case
				const isMultipleSelect = element.getStaticAttributeValue('multiple');
				const i = block.getUniqueName('i');
				const option = block.getUniqueName('option');

				const ifStatement = isMultipleSelect
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

						${ifStatement}
					}
				`;

				block.builders.mount.addBlock(deindent`
					${last} = ${value};
					${updater}
				`);
			} else if (propertyName) {
				block.builders.hydrate.addLine(
					`${element.var}.${propertyName} = ${init};`
				);
				updater = `${element.var}.${propertyName} = ${shouldCache ? last : value};`;
			} else if (isDataSet) {
				block.builders.hydrate.addLine(
					`${element.var}.dataset.${camelCaseName} = ${init};`
				);
				updater = `${element.var}.dataset.${camelCaseName} = ${shouldCache ? last : value};`;
			} else {
				block.builders.hydrate.addLine(
					`${method}(${element.var}, "${name}", ${init});`
				);
				updater = `${method}(${element.var}, "${name}", ${shouldCache ? last : value});`;
			}

			// only add an update if mutations are involved (or it's a select?)
			const dependencies = this.node.get_dependencies();
			if (dependencies.length > 0 || isSelectValueAttribute) {
				const changedCheck = (
					(block.hasOutros ? `!#current || ` : '') +
					dependencies.map(dependency => `changed.${dependency}`).join(' || ')
				);

				const updateCachedValue = `${last} !== (${last} = ${value})`;

				const condition = shouldCache
					? (dependencies.length ? `(${changedCheck}) && ${updateCachedValue}` : updateCachedValue)
					: changedCheck;

				block.builders.update.addConditional(
					condition,
					updater
				);
			}
		} else {
			const value = this.node.getValue();

			const statement = (
				isLegacyInputType
					? `@setInputType(${element.var}, ${value});`
					: propertyName
						? `${element.var}.${propertyName} = ${value};`
						: isDataSet
							? `${element.var}.dataset.${camelCaseName} = ${value};`
							: `${method}(${element.var}, "${name}", ${value === true ? '""' : value});`
			);

			block.builders.hydrate.addLine(statement);

			// special case – autofocus. has to be handled in a bit of a weird way
			if (this.node.isTrue && name === 'autofocus') {
				block.autofocus = element.var;
			}
		}

		if (isIndirectlyBoundValue) {
			const updateValue = `${element.var}.value = ${element.var}.__value;`;

			block.builders.hydrate.addLine(updateValue);
			if (this.node.isDynamic) block.builders.update.addLine(updateValue);
		}
	}

	stringify() {
		if (this.node.isTrue) return '';

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
const attributeLookup = {
	accept: { appliesTo: ['form', 'input'] },
	'accept-charset': { propertyName: 'acceptCharset', appliesTo: ['form'] },
	accesskey: { propertyName: 'accessKey' },
	action: { appliesTo: ['form'] },
	align: {
		appliesTo: [
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
	allowfullscreen: { propertyName: 'allowFullscreen', appliesTo: ['iframe'] },
	alt: { appliesTo: ['applet', 'area', 'img', 'input'] },
	async: { appliesTo: ['script'] },
	autocomplete: { appliesTo: ['form', 'input'] },
	autofocus: { appliesTo: ['button', 'input', 'keygen', 'select', 'textarea'] },
	autoplay: { appliesTo: ['audio', 'video'] },
	autosave: { appliesTo: ['input'] },
	bgcolor: {
		propertyName: 'bgColor',
		appliesTo: [
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
	border: { appliesTo: ['img', 'object', 'table'] },
	buffered: { appliesTo: ['audio', 'video'] },
	challenge: { appliesTo: ['keygen'] },
	charset: { appliesTo: ['meta', 'script'] },
	checked: { appliesTo: ['command', 'input'] },
	cite: { appliesTo: ['blockquote', 'del', 'ins', 'q'] },
	class: { propertyName: 'className' },
	code: { appliesTo: ['applet'] },
	codebase: { propertyName: 'codeBase', appliesTo: ['applet'] },
	color: { appliesTo: ['basefont', 'font', 'hr'] },
	cols: { appliesTo: ['textarea'] },
	colspan: { propertyName: 'colSpan', appliesTo: ['td', 'th'] },
	content: { appliesTo: ['meta'] },
	contenteditable: { propertyName: 'contentEditable' },
	contextmenu: {},
	controls: { appliesTo: ['audio', 'video'] },
	coords: { appliesTo: ['area'] },
	data: { appliesTo: ['object'] },
	datetime: { propertyName: 'dateTime', appliesTo: ['del', 'ins', 'time'] },
	default: { appliesTo: ['track'] },
	defer: { appliesTo: ['script'] },
	dir: {},
	dirname: { propertyName: 'dirName', appliesTo: ['input', 'textarea'] },
	disabled: {
		appliesTo: [
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
	download: { appliesTo: ['a', 'area'] },
	draggable: {},
	dropzone: {},
	enctype: { appliesTo: ['form'] },
	for: { propertyName: 'htmlFor', appliesTo: ['label', 'output'] },
	form: {
		appliesTo: [
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
	formaction: { appliesTo: ['input', 'button'] },
	headers: { appliesTo: ['td', 'th'] },
	height: {
		appliesTo: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'video'],
	},
	hidden: {},
	high: { appliesTo: ['meter'] },
	href: { appliesTo: ['a', 'area', 'base', 'link'] },
	hreflang: { appliesTo: ['a', 'area', 'link'] },
	'http-equiv': { propertyName: 'httpEquiv', appliesTo: ['meta'] },
	icon: { appliesTo: ['command'] },
	id: {},
	indeterminate: { appliesTo: ['input'] },
	ismap: { propertyName: 'isMap', appliesTo: ['img'] },
	itemprop: {},
	keytype: { appliesTo: ['keygen'] },
	kind: { appliesTo: ['track'] },
	label: { appliesTo: ['track'] },
	lang: {},
	language: { appliesTo: ['script'] },
	loop: { appliesTo: ['audio', 'bgsound', 'marquee', 'video'] },
	low: { appliesTo: ['meter'] },
	manifest: { appliesTo: ['html'] },
	max: { appliesTo: ['input', 'meter', 'progress'] },
	maxlength: { propertyName: 'maxLength', appliesTo: ['input', 'textarea'] },
	media: { appliesTo: ['a', 'area', 'link', 'source', 'style'] },
	method: { appliesTo: ['form'] },
	min: { appliesTo: ['input', 'meter'] },
	multiple: { appliesTo: ['input', 'select'] },
	muted: { appliesTo: ['audio', 'video'] },
	name: {
		appliesTo: [
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
	novalidate: { propertyName: 'noValidate', appliesTo: ['form'] },
	open: { appliesTo: ['details'] },
	optimum: { appliesTo: ['meter'] },
	pattern: { appliesTo: ['input'] },
	ping: { appliesTo: ['a', 'area'] },
	placeholder: { appliesTo: ['input', 'textarea'] },
	poster: { appliesTo: ['video'] },
	preload: { appliesTo: ['audio', 'video'] },
	radiogroup: { appliesTo: ['command'] },
	readonly: { propertyName: 'readOnly', appliesTo: ['input', 'textarea'] },
	rel: { appliesTo: ['a', 'area', 'link'] },
	required: { appliesTo: ['input', 'select', 'textarea'] },
	reversed: { appliesTo: ['ol'] },
	rows: { appliesTo: ['textarea'] },
	rowspan: { propertyName: 'rowSpan', appliesTo: ['td', 'th'] },
	sandbox: { appliesTo: ['iframe'] },
	scope: { appliesTo: ['th'] },
	scoped: { appliesTo: ['style'] },
	seamless: { appliesTo: ['iframe'] },
	selected: { appliesTo: ['option'] },
	shape: { appliesTo: ['a', 'area'] },
	size: { appliesTo: ['input', 'select'] },
	sizes: { appliesTo: ['link', 'img', 'source'] },
	span: { appliesTo: ['col', 'colgroup'] },
	spellcheck: {},
	src: {
		appliesTo: [
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
	srcdoc: { appliesTo: ['iframe'] },
	srclang: { appliesTo: ['track'] },
	srcset: { appliesTo: ['img'] },
	start: { appliesTo: ['ol'] },
	step: { appliesTo: ['input'] },
	style: { propertyName: 'style.cssText' },
	summary: { appliesTo: ['table'] },
	tabindex: { propertyName: 'tabIndex' },
	target: { appliesTo: ['a', 'area', 'base', 'form'] },
	title: {},
	type: {
		appliesTo: [
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
	usemap: { propertyName: 'useMap', appliesTo: ['img', 'input', 'object'] },
	value: {
		appliesTo: [
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
	volume: { appliesTo: ['audio', 'video'] },
	width: {
		appliesTo: ['canvas', 'embed', 'iframe', 'img', 'input', 'object', 'video'],
	},
	wrap: { appliesTo: ['textarea'] },
};

Object.keys(attributeLookup).forEach(name => {
	const metadata = attributeLookup[name];
	if (!metadata.propertyName) metadata.propertyName = name;
});

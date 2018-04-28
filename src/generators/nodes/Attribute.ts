import deindent from '../../utils/deindent';
import { stringify } from '../../utils/stringify';
import fixAttributeCasing from '../../utils/fixAttributeCasing';
import addToSet from '../../utils/addToSet';
import { DomGenerator } from '../dom/index';
import Node from './shared/Node';
import Element from './Element';
import Text from './Text';
import Block from '../dom/Block';
import Expression from './shared/Expression';

export interface StyleProp {
	key: string;
	value: Node[];
}

export default class Attribute extends Node {
	type: 'Attribute';
	start: number;
	end: number;

	compiler: DomGenerator;
	parent: Element;
	name: string;
	isSpread: boolean;
	isTrue: boolean;
	isDynamic: boolean;
	isSynthetic: boolean;
	shouldCache: boolean;
	expression?: Expression;
	chunks: (Text | Expression)[];
	dependencies: Set<string>;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		if (info.type === 'Spread') {
			this.name = null;
			this.isSpread = true;
			this.isTrue = false;
			this.isSynthetic = false;

			this.expression = new Expression(compiler, this, scope, info.expression);
			this.dependencies = this.expression.dependencies;
			this.chunks = null;

			this.isDynamic = true; // TODO not necessarily
			this.shouldCache = false; // TODO does this mean anything here?
		}

		else {
			this.name = info.name;
			this.isTrue = info.value === true;
			this.isSynthetic = info.synthetic;

			this.dependencies = new Set();

			this.chunks = this.isTrue
				? []
				: info.value.map(node => {
					if (node.type === 'Text') return node;

					const expression = new Expression(compiler, this, scope, node.expression);

					addToSet(this.dependencies, expression.dependencies);
					return expression;
				});

			// TODO this would be better, but it breaks some stuff
			// this.isDynamic = this.dependencies.size > 0;
			this.isDynamic = this.chunks.length === 1
				? this.chunks[0].type !== 'Text'
				: this.chunks.length > 1;

			this.shouldCache = this.isDynamic
				? this.chunks.length === 1
					? this.chunks[0].node.type !== 'Identifier' || scope.names.has(this.chunks[0].node.name)
					: true
				: false;
		}
	}

	getValue() {
		if (this.isTrue) return true;
		if (this.chunks.length === 0) return `''`;

		if (this.chunks.length === 1) {
			return this.chunks[0].type === 'Text'
				? stringify(this.chunks[0].data)
				: this.chunks[0].snippet;
		}

		return (this.chunks[0].type === 'Text' ? '' : `"" + `) +
			this.chunks
				.map(chunk => {
					if (chunk.type === 'Text') {
						return stringify(chunk.data);
					} else {
						return chunk.getPrecedence() <= 13 ? `(${chunk.snippet})` : chunk.snippet;
					}
				})
				.join(' + ');
	}

	render(block: Block) {
		const node = this.parent;
		const name = fixAttributeCasing(this.name);

		if (name === 'style') {
			const styleProps = optimizeStyle(this.chunks);
			if (styleProps) {
				this.renderStyle(block, styleProps);
				return;
			}
		}

		let metadata = node.namespace ? null : attributeLookup[name];
		if (metadata && metadata.appliesTo && !~metadata.appliesTo.indexOf(node.name))
			metadata = null;

		const isIndirectlyBoundValue =
			name === 'value' &&
			(node.name === 'option' || // TODO check it's actually bound
				(node.name === 'input' &&
					node.bindings.find(
						(binding: Binding) =>
							/checked|group/.test(binding.name)
						)));

		const propertyName = isIndirectlyBoundValue
			? '__value'
			: metadata && metadata.propertyName;

		// xlink is a special case... we could maybe extend this to generic
		// namespaced attributes but I'm not sure that's applicable in
		// HTML5?
		const method = name.slice(0, 6) === 'xlink:'
			? '@setXlinkAttribute'
			: '@setAttribute';

		const isLegacyInputType = this.compiler.legacy && name === 'type' && this.parent.name === 'input';

		const isDataSet = /^data-/.test(name) && !this.compiler.legacy && !node.namespace;
		const camelCaseName = isDataSet ? name.replace('data-', '').replace(/(-\w)/g, function (m) {
			return m[1].toUpperCase();
		}) : name;

		if (this.isDynamic) {
			let value;

			// TODO some of this code is repeated in Tag.ts — would be good to
			// DRY it out if that's possible without introducing crazy indirection
			if (this.chunks.length === 1) {
				// single {tag} — may be a non-string
				value = this.chunks[0].snippet;
			} else {
				// '{foo} {bar}' — treat as string concatenation
				value =
					(this.chunks[0].type === 'Text' ? '' : `"" + `) +
					this.chunks
						.map((chunk: Node) => {
							if (chunk.type === 'Text') {
								return stringify(chunk.data);
							} else {
								return chunk.getPrecedence() <= 13
									? `(${chunk.snippet})`
									: chunk.snippet;
							}
						})
						.join(' + ');
			}

			const isSelectValueAttribute =
				name === 'value' && node.name === 'select';

			const shouldCache = this.shouldCache || isSelectValueAttribute;

			const last = shouldCache && block.getUniqueName(
				`${node.var}_${name.replace(/[^a-zA-Z_$]/g, '_')}_value`
			);

			if (shouldCache) block.addVariable(last);

			let updater;
			const init = shouldCache ? `${last} = ${value}` : value;

			if (isLegacyInputType) {
				block.builders.hydrate.addLine(
					`@setInputType(${node.var}, ${init});`
				);
				updater = `@setInputType(${node.var}, ${shouldCache ? last : value});`;
			} else if (isSelectValueAttribute) {
				// annoying special case
				const isMultipleSelect = node.getStaticAttributeValue('multiple');
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
					for (var ${i} = 0; ${i} < ${node.var}.options.length; ${i} += 1) {
						var ${option} = ${node.var}.options[${i}];

						${ifStatement}
					}
				`;

				block.builders.hydrate.addBlock(deindent`
					${last} = ${value};
					${updater}
				`);
			} else if (propertyName) {
				block.builders.hydrate.addLine(
					`${node.var}.${propertyName} = ${init};`
				);
				updater = `${node.var}.${propertyName} = ${shouldCache ? last : value};`;
			} else if (isDataSet) {
				block.builders.hydrate.addLine(
					`${node.var}.dataset.${camelCaseName} = ${init};`
				);
				updater = `${node.var}.dataset.${camelCaseName} = ${shouldCache ? last : value};`;
			} else {
				block.builders.hydrate.addLine(
					`${method}(${node.var}, "${name}", ${init});`
				);
				updater = `${method}(${node.var}, "${name}", ${shouldCache ? last : value});`;
			}

			if (this.dependencies.size || isSelectValueAttribute) {
				const dependencies = Array.from(this.dependencies);
				const changedCheck = (
					( block.hasOutroMethod ? `#outroing || ` : '' ) +
					dependencies.map(dependency => `changed.${dependency}`).join(' || ')
				);

				const updateCachedValue = `${last} !== (${last} = ${value})`;

				const condition = shouldCache ?
					( dependencies.length ? `(${changedCheck}) && ${updateCachedValue}` : updateCachedValue ) :
					changedCheck;

				block.builders.update.addConditional(
					condition,
					updater
				);
			}
		} else {
			const value = this.isTrue
				? 'true'
				: this.chunks.length === 0 ? `""` : stringify(this.chunks[0].data);

			const statement = (
				isLegacyInputType
					? `@setInputType(${node.var}, ${value});`
					: propertyName
						? `${node.var}.${propertyName} = ${value};`
						: isDataSet
							? `${node.var}.dataset.${camelCaseName} = ${value};`
							: `${method}(${node.var}, "${name}", ${value});`
			);

			block.builders.hydrate.addLine(statement);

			// special case – autofocus. has to be handled in a bit of a weird way
			if (this.isTrue && name === 'autofocus') {
				block.autofocus = node.var;
			}
		}

		if (isIndirectlyBoundValue) {
			const updateValue = `${node.var}.value = ${node.var}.__value;`;

			block.builders.hydrate.addLine(updateValue);
			if (this.isDynamic) block.builders.update.addLine(updateValue);
		}
	}

	renderStyle(
		block: Block,
		styleProps: StyleProp[]
	) {
		styleProps.forEach((prop: StyleProp) => {
			let value;

			if (isDynamic(prop.value)) {
				const propDependencies = new Set();
				let shouldCache;

				value =
					((prop.value.length === 1 || prop.value[0].type === 'Text') ? '' : `"" + `) +
					prop.value
						.map((chunk: Node) => {
							if (chunk.type === 'Text') {
								return stringify(chunk.data);
							} else {
								const { dependencies, snippet } = chunk;

								dependencies.forEach(d => {
									propDependencies.add(d);
								});

								return chunk.getPrecedence() <= 13 ? `(${snippet})` : snippet;
							}
						})
						.join(' + ');

				if (propDependencies.size) {
					const dependencies = Array.from(propDependencies);
					const condition = (
						(block.hasOutroMethod ? `#outroing || ` : '') +
						dependencies.map(dependency => `changed.${dependency}`).join(' || ')
					);

					block.builders.update.addConditional(
						condition,
						`@setStyle(${this.parent.var}, "${prop.key}", ${value});`
					);
				}
			} else {
				value = stringify(prop.value[0].data);
			}

			block.builders.hydrate.addLine(
				`@setStyle(${this.parent.var}, "${prop.key}", ${value});`
			);
		});
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

function optimizeStyle(value: Node[]) {
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

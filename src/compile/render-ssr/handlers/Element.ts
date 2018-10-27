import { quotePropIfNecessary, quoteNameIfNecessary } from '../../../utils/quoteIfNecessary';
import isVoidElementName from '../../../utils/isVoidElementName';
import Attribute from '../../nodes/Attribute';
import Node from '../../nodes/shared/Node';
import { escapeTemplate } from '../../../utils/stringify';

// source: https://gist.github.com/ArjanSchouten/0b8574a6ad7f5065a5e7
const boolean_attributes = new Set([
	'async',
	'autocomplete',
	'autofocus',
	'autoplay',
	'border',
	'challenge',
	'checked',
	'compact',
	'contenteditable',
	'controls',
	'default',
	'defer',
	'disabled',
	'formnovalidate',
	'frameborder',
	'hidden',
	'indeterminate',
	'ismap',
	'loop',
	'multiple',
	'muted',
	'nohref',
	'noresize',
	'noshade',
	'novalidate',
	'nowrap',
	'open',
	'readonly',
	'required',
	'reversed',
	'scoped',
	'scrolling',
	'seamless',
	'selected',
	'sortable',
	'spellcheck',
	'translate'
]);

export default function(node, renderer, options) {
	let openingTag = `<${node.name}`;
	let textareaContents; // awkward special case

	const slot = node.getStaticAttributeValue('slot');
	if (slot && node.hasAncestor('InlineComponent')) {
		const slot = node.attributes.find((attribute: Node) => attribute.name === 'slot');
		const slotName = slot.chunks[0].data;
		const target = renderer.targets[renderer.targets.length - 1];
		target.slotStack.push(slotName);
		target.slots[slotName] = '';
	}

	const classExpr = node.classes.map((classDir: Class) => {
		const { expression, name } = classDir;
		const snippet = expression ? expression.snippet : `ctx${quotePropIfNecessary(name)}`;
		return `${snippet} ? "${name}" : ""`;
	}).join(', ');

	let addClassAttribute = classExpr ? true : false;

	if (node.attributes.find(attr => attr.isSpread)) {
		// TODO dry this out
		const args = [];
		node.attributes.forEach(attribute => {
			if (attribute.isSpread) {
				args.push(attribute.expression.snippet);
			} else {
				if (attribute.name === 'value' && node.name === 'textarea') {
					textareaContents = stringifyAttribute(attribute);
				} else if (attribute.isTrue) {
					args.push(`{ ${quoteNameIfNecessary(attribute.name)}: true }`);
				} else if (
					boolean_attributes.has(attribute.name) &&
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					// a boolean attribute with one non-Text chunk
					args.push(`{ ${quoteNameIfNecessary(attribute.name)}: ${attribute.chunks[0].snippet} }`);
				} else {
					args.push(`{ ${quoteNameIfNecessary(attribute.name)}: \`${stringifyAttribute(attribute)}\` }`);
				}
			}
		});

		openingTag += "${@spread([" + args.join(', ') + "])}";
	} else {
		node.attributes.forEach((attribute: Attribute) => {
			if (attribute.type !== 'Attribute') return;

			if (attribute.name === 'value' && node.name === 'textarea') {
				textareaContents = stringifyAttribute(attribute);
			} else if (attribute.isTrue) {
				openingTag += ` ${attribute.name}`;
			} else if (
				boolean_attributes.has(attribute.name) &&
				attribute.chunks.length === 1 &&
				attribute.chunks[0].type !== 'Text'
			) {
				// a boolean attribute with one non-Text chunk
				openingTag += '${' + attribute.chunks[0].snippet + ' ? " ' + attribute.name + '" : "" }';
			} else if (attribute.name === 'class' && classExpr) {
				addClassAttribute = false;
				openingTag += ` class="\${[\`${stringifyAttribute(attribute)}\`, ${classExpr}].join(' ').trim() }"`;
			} else if (attribute.isConcatenated || !attribute.isDynamic) {
				openingTag += ` ${attribute.name}="${stringifyAttribute(attribute)}"`;
			} else {
				const { name } = attribute;
				const { snippet } = attribute.chunks[0];

				openingTag += '${(v => v == null ? "" : ` ' + name + '=${' + snippet + '}`)(' + snippet + ')}';
			}
		});
	}

	node.bindings.forEach(binding => {
		const { name, value: { snippet } } = binding;

		if (name === 'group') {
			// TODO server-render group bindings
		} else {
			openingTag += ' ${(v => v ? ("' + name + '" + (v === true ? "" : "=" + JSON.stringify(v))) : "")(' + snippet + ')}';
		}
	});

	if (addClassAttribute) {
		openingTag += `\${((v) => v ? ' class="' + v + '"' : '')([${classExpr}].join(' ').trim())}`;
	}

	openingTag += '>';

	renderer.append(openingTag);

	if (node.name === 'textarea' && textareaContents !== undefined) {
		renderer.append(textareaContents);
	} else {
		renderer.render(node.children, options);
	}

	if (!isVoidElementName(node.name)) {
		renderer.append(`</${node.name}>`);
	}
}

function stringifyAttribute(attribute: Attribute) {
	return attribute.chunks
		.map((chunk: Node) => {
			if (chunk.type === 'Text') {
				return escapeTemplate(escape(chunk.data).replace(/"/g, '&quot;'));
			}

			return '${@escape(' + chunk.snippet + ')}';
		})
		.join('');
}
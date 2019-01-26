import { quotePropIfNecessary, quoteNameIfNecessary } from '../../../utils/quoteIfNecessary';
import isVoidElementName from '../../../utils/isVoidElementName';
import Attribute from '../../nodes/Attribute';
import Node from '../../nodes/shared/Node';
import { snip } from '../../../utils/snip';
import { stringify_attribute } from '../../../utils/stringify_attribute';
import { get_slot_scope } from './shared/get_slot_scope';

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

		options.slot_scopes.set(slotName, get_slot_scope(node.lets));
	}

	const classExpr = node.classes.map((classDir: Class) => {
		const { expression, name } = classDir;
		const snippet = expression ? snip(expression) : `ctx${quotePropIfNecessary(name)}`;
		return `${snippet} ? "${name}" : ""`;
	}).join(', ');

	let addClassAttribute = classExpr ? true : false;

	if (node.attributes.find(attr => attr.isSpread)) {
		// TODO dry this out
		const args = [];
		node.attributes.forEach(attribute => {
			if (attribute.isSpread) {
				args.push(snip(attribute.expression));
			} else {
				if (attribute.name === 'value' && node.name === 'textarea') {
					textareaContents = stringify_attribute(attribute);
				} else if (attribute.isTrue) {
					args.push(`{ ${quoteNameIfNecessary(attribute.name)}: true }`);
				} else if (
					boolean_attributes.has(attribute.name) &&
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					// a boolean attribute with one non-Text chunk
					args.push(`{ ${quoteNameIfNecessary(attribute.name)}: ${snip(attribute.chunks[0])} }`);
				} else {
					args.push(`{ ${quoteNameIfNecessary(attribute.name)}: \`${stringify_attribute(attribute)}\` }`);
				}
			}
		});

		openingTag += "${@spread([" + args.join(', ') + "])}";
	} else {
		node.attributes.forEach((attribute: Attribute) => {
			if (attribute.type !== 'Attribute') return;

			if (attribute.name === 'value' && node.name === 'textarea') {
				textareaContents = stringify_attribute(attribute);
			} else if (attribute.isTrue) {
				openingTag += ` ${attribute.name}`;
			} else if (
				boolean_attributes.has(attribute.name) &&
				attribute.chunks.length === 1 &&
				attribute.chunks[0].type !== 'Text'
			) {
				// a boolean attribute with one non-Text chunk
				openingTag += '${' + snip(attribute.chunks[0]) + ' ? " ' + attribute.name + '" : "" }';
			} else if (attribute.name === 'class' && classExpr) {
				addClassAttribute = false;
				openingTag += ` class="\${[\`${stringify_attribute(attribute)}\`, ${classExpr}].join(' ').trim() }"`;
			} else if (attribute.chunks.length === 1 && attribute.chunks[0].type !== 'Text') {
				const { name } = attribute;
				const snippet = snip(attribute.chunks[0]);

				openingTag += '${(v => v == null ? "" : ` ' + name + '="${@escape(' + snippet + ')}"`)(' + snippet + ')}';
			} else {
				openingTag += ` ${attribute.name}="${stringify_attribute(attribute)}"`;
			}
		});
	}

	node.bindings.forEach(binding => {
		const { name, expression } = binding;

		if (name === 'group') {
			// TODO server-render group bindings
		} else {
			const snippet = snip(expression);
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
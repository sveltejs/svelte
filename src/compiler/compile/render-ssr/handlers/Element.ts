import { is_void, quote_prop_if_necessary, quote_name_if_necessary } from '../../../utils/names';
import Attribute from '../../nodes/Attribute';
import Class from '../../nodes/Class';
import { snip } from '../../utils/snip';
import { stringify_attribute } from '../../utils/stringify_attribute';
import { get_slot_scope } from './shared/get_slot_scope';
import Renderer, { RenderOptions } from '../Renderer';
import Element from '../../nodes/Element';
import Text from '../../nodes/Text';

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

export default function(node: Element, renderer: Renderer, options: RenderOptions & {
	slot_scopes: Map<any, any>;
}) {
	let opening_tag = `<${node.name}`;

	// awkward special case
	let node_contents;
	let value;

	const contenteditable = (
		node.name !== 'textarea' &&
		node.name !== 'input' &&
		node.attributes.some((attribute) => attribute.name === 'contenteditable')
	);

	const slot = node.get_static_attribute_value('slot');
	const component = node.find_nearest(/InlineComponent/);
	if (slot && component) {
		const slot = node.attributes.find((attribute) => attribute.name === 'slot');
		const slot_name = (slot.chunks[0] as Text).data;
		const target = renderer.targets[renderer.targets.length - 1];
		target.slot_stack.push(slot_name);
		target.slots[slot_name] = '';

		const lets = node.lets;
		const seen = new Set(lets.map(l => l.name));

		component.lets.forEach(l => {
			if (!seen.has(l.name)) lets.push(l);
		});

		options.slot_scopes.set(slot_name, get_slot_scope(node.lets));
	}

	const class_expression = node.classes.map((class_directive: Class) => {
		const { expression, name } = class_directive;
		const snippet = expression ? snip(expression) : `ctx${quote_prop_if_necessary(name)}`;
		return `${snippet} ? "${name}" : ""`;
	}).join(', ');

	let add_class_attribute = class_expression ? true : false;

	if (node.attributes.find(attr => attr.is_spread)) {
		// TODO dry this out
		const args = [];
		node.attributes.forEach(attribute => {
			if (attribute.is_spread) {
				args.push(snip(attribute.expression));
			} else {
				if (attribute.name === 'value' && node.name === 'textarea') {
					node_contents = stringify_attribute(attribute, true);
				} else if (attribute.is_true) {
					args.push(`{ ${quote_name_if_necessary(attribute.name)}: true }`);
				} else if (
					boolean_attributes.has(attribute.name) &&
					attribute.chunks.length === 1 &&
					attribute.chunks[0].type !== 'Text'
				) {
					// a boolean attribute with one non-Text chunk
					args.push(`{ ${quote_name_if_necessary(attribute.name)}: ${snip(attribute.chunks[0])} }`);
				} else {
					args.push(`{ ${quote_name_if_necessary(attribute.name)}: \`${stringify_attribute(attribute, true)}\` }`);
				}
			}
		});

		opening_tag += "${@spread([" + args.join(', ') + "])}";
	} else {
		node.attributes.forEach((attribute: Attribute) => {
			if (attribute.type !== 'Attribute') return;

			if (attribute.name === 'value' && node.name === 'textarea') {
				node_contents = stringify_attribute(attribute, true);
			} else if (attribute.is_true) {
				opening_tag += ` ${attribute.name}`;
			} else if (
				boolean_attributes.has(attribute.name) &&
				attribute.chunks.length === 1 &&
				attribute.chunks[0].type !== 'Text'
			) {
				// a boolean attribute with one non-Text chunk
				opening_tag += '${' + snip(attribute.chunks[0]) + ' ? " ' + attribute.name + '" : "" }';
			} else if (attribute.name === 'class' && class_expression) {
				add_class_attribute = false;
				opening_tag += ` class="\${[\`${stringify_attribute(attribute, true)}\`, ${class_expression}].join(' ').trim() }"`;
			} else if (attribute.chunks.length === 1 && attribute.chunks[0].type !== 'Text') {
				const { name } = attribute;
				const snippet = snip(attribute.chunks[0]);

				opening_tag += '${(v => v == null ? "" : ` ' + name + '="${@escape(' + snippet + ')}"`)(' + snippet + ')}';
			} else {
				opening_tag += ` ${attribute.name}="${stringify_attribute(attribute, true)}"`;
			}
		});
	}

	node.bindings.forEach(binding => {
		const { name, expression } = binding;

		if (binding.is_readonly) {
			return;
		}

		if (name === 'group') {
			// TODO server-render group bindings
		} else if (contenteditable && (name === 'text' || name === 'html')) {
			node_contents = snip(expression);
			value = name === 'text' ? '@escape($$value)' : '$$value';
		} else if (binding.name === 'value' && node.name === 'textarea') {
			const snippet = snip(expression);
			node_contents = '${(' + snippet + ') || ""}';
		} else {
			const snippet = snip(expression);
			opening_tag += '${@add_attribute("' + name + '", ' + snippet + ')}';
		}
	});

	if (add_class_attribute) {
		opening_tag += `\${@add_classes([${class_expression}].join(' ').trim())}`;
	}

	opening_tag += '>';

	renderer.append(opening_tag);

	if (node_contents !== undefined) {
		if (contenteditable) {
			renderer.append('${($$value => $$value === void 0 ? `');
			renderer.render(node.children, options);
			renderer.append('` : ' + value + ')(' + node_contents + ')}');
		} else {
			renderer.append(node_contents);
		}
	} else {
		renderer.render(node.children, options);
	}

	if (!is_void(node.name)) {
		renderer.append(`</${node.name}>`);
	}
}

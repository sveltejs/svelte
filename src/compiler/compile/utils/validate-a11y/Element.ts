import Element from '../../nodes/Element';
import Attribute from '../../nodes/Attribute';
import EventHandler from '../../nodes/EventHandler';
import fuzzymatch from '../../../utils/fuzzymatch';
import emojiRegex from 'emoji-regex';
import Text from '../../nodes/Text';
import { array_to_string, is_hidden_from_screen_reader } from './utils';
import { roles } from 'aria-query';
import get_implicit_role from './implicit_role';

export default function validateA11y(element: Element) {
	const attribute_map = new Map();
	const handler_map = new Map();

	element.attributes.forEach(attribute => {
		attribute_map.set(attribute.name, attribute);
	});
	element.handlers.forEach(handler => {
		handler_map.set(handler.name, handler);
	});

	no_distracting_elements(element);
	structure(element);
	no_missing_attribute(element, attribute_map);
	required_content(element);
	no_missing_handlers(element, handler_map);
	img_redundant_alt(element, attribute_map);
	accessible_emoji(element, attribute_map);
	no_unknown_role(element, attribute_map);
}

const a11y_distracting_elements = new Set(['blink', 'marquee']);
function no_distracting_elements(element: Element) {
	if (a11y_distracting_elements.has(element.name)) {
		// no-distracting-elements
		element.component.warn(element, {
			code: `a11y-distracting-elements`,
			message: `A11y: Avoid <${element.name}> elements`,
		});
	}
}

function structure(element: Element) {
	if (element.name === 'figcaption') {
		let { parent } = element;
		let is_figure_parent = false;

		while (parent) {
			if ((parent as Element).name === 'figure') {
				is_figure_parent = true;
				break;
			}
			if (parent.type === 'Element') {
				break;
			}
			parent = parent.parent;
		}

		if (!is_figure_parent) {
			element.component.warn(element, {
				code: `a11y-structure`,
				message: `A11y: <figcaption> must be an immediate child of <figure>`,
			});
		}
	}
	if (element.name === 'figure') {
		const children = element.children.filter(node => {
			if (node.type === 'Comment') return false;
			if (node.type === 'Text') return /\S/.test(node.data);
			return true;
		});

		const index = children.findIndex(
			child => (child as Element).name === 'figcaption'
		);

		if (index !== -1 && (index !== 0 && index !== children.length - 1)) {
			element.component.warn(children[index], {
				code: `a11y-structure`,
				message: `A11y: <figcaption> must be first or last child of <figure>`,
			});
		}
	}
}

const a11y_required_attributes = {
	a: ['href'],
	area: ['alt', 'aria-label', 'aria-labelledby'],

	// html-has-lang
	html: ['lang'],

	// iframe-has-title
	iframe: ['title'],
	img: ['alt'],
	object: ['title', 'aria-label', 'aria-labelledby'],

	// input
	['input type="image"']: ['alt', 'aria-label', 'aria-labelledby'],
};

function no_missing_attribute(
	element: Element,
	attribute_map: Map<string, Attribute>
) {
	if (element.name === 'a') {
		const attribute =
			attribute_map.get('href') || attribute_map.get('xlink:href');

		if (attribute) {
			const value = attribute.get_static_value();

			if (value === '' || value === '#') {
				element.component.warn(attribute, {
					code: `a11y-invalid-attribute`,
					message: `A11y: '${value}' is not a valid ${attribute.name} attribute`,
				});
			}
		} else {
			element.component.warn(element, {
				code: `a11y-missing-attribute`,
				message: `A11y: <a> element should have an href attribute`,
			});
		}
	} else {
		let name = element.name;
		if (element.name === 'input') {
			const type = attribute_map.get('type');
			if (type && type.get_static_value() === 'image') {
				name = 'input type="image"';
			}
		}

		const required_attributes = a11y_required_attributes[name];
		if (required_attributes) {
			const has_attribute = required_attributes.some(name =>
				attribute_map.has(name)
			);

			if (!has_attribute) {
				should_have_attribute(element, required_attributes, name);
			}
		}
	}
}

function should_have_attribute(node, attributes: string[], name = node.name) {
	const article = /^[aeiou]/.test(attributes[0]) ? 'an' : 'a';
	const sequence = array_to_string(attributes);

	node.component.warn(node, {
		code: `a11y-missing-attribute`,
		message: `A11y: <${name}> element should have ${article} ${sequence} attribute`,
	});
}

const a11y_required_content = new Set([
	// anchor-has-content
	'a',

	// heading-has-content
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
]);
function required_content(element: Element) {
	if (!a11y_required_content.has(element.name)) return;

	if (element.children.length === 0) {
		element.component.warn(element, {
			code: `a11y-missing-content`,
			message: `A11y: <${element.name}> element should have child content`,
		});
	}
}

function no_missing_handlers(
	element: Element,
	handler_map: Map<string, EventHandler>
) {
	if (
		handler_map.has('click') &&
		!(
			handler_map.has('keypress') ||
			handler_map.has('keydown') ||
			handler_map.has('keyup')
		)
	) {
		element.component.warn(element, {
			code: `a11y-click-events-have-key-events`,
			message: `A11y: Visible, non-interactive elements with click handlers must have at least one keyboard listener.`,
		});
	}
}

const a11y_redundant_alt = /image|photo|picture/i;
function img_redundant_alt(
	element: Element,
	attribute_map: Map<string, Attribute>
) {
	if (element.name === 'img') {
		const alt_attribute = attribute_map.get('alt');
		if (
			alt_attribute &&
			!is_hidden_from_screen_reader(element.name, attribute_map)
		) {
			for (const chunk of alt_attribute.chunks) {
				if (contain_text(chunk, a11y_redundant_alt)) {
					element.component.warn(alt_attribute, {
						code: `a11y-img-redundant-alt`,
						message:
							'A11y: Redundant alt attribute. Screen-readers already announce `img` tags as an image. You don’t need to use the words `image`, `photo,` or `picture` (or any specified custom words) in the alt prop.',
					});
					break;
				}
			}
		}
	}
}

function accessible_emoji(
	element: Element,
	attribute_map: Map<string, Attribute>
) {
	const has_emoji = element.children.some(child =>
		contain_text(child, emojiRegex())
	);
	if (has_emoji) {
		const is_span = element.name === 'span';
		const has_label =
			attribute_map.has('aria-labelledby') || attribute_map.has('aria-label');
		const role = attribute_map.get('role');
		const role_value =
			role && role.chunks[0].type === 'Text'
				? (role.chunks[0] as Text).data
				: null;
		if (!has_label || role_value !== 'img' || !is_span) {
			element.component.warn(element, {
				code: `a11y-accessible-emoji`,
				message: `A11y: Emojis should be wrapped in <span>, have role="img", and have an accessible description with aria-label or aria-labelledby.`,
			});
		}
	}
}

function contain_text(node, regex: RegExp) {
	switch (node.type) {
		case 'Text':
			return regex.test(node.data);
		case 'Literal':
			return regex.test(node.value);
		case 'Expression':
			return contain_text(node.node, regex);
		case 'TemplateLiteral':
			return node.quasis.some(quasi => contain_text(quasi, regex));
		case 'TemplateElement':
			return regex.test(node.value.cooked);
		default:
			return false;
	}
}

const aria_role_set = new Set(roles.keys());
const aria_roles = [...aria_role_set];
const role_exceptions = new Map([['nav', 'navigation']]);
function no_unknown_role(
	element: Element,
	attribute_map: Map<string, Attribute>
) {
	if (!attribute_map.has('role')) {
		return;
	}

	const role_attribute = attribute_map.get('role');
	const value = role_attribute.get_static_value();
	// @ts-ignore
	if (value && !aria_role_set.has(value)) {
		// @ts-ignore
		const match = fuzzymatch(value, aria_roles);
		let message = `A11y: Unknown role '${value}'`;
		if (match) message += ` (did you mean '${match}'?)`;

		element.component.warn(role_attribute, {
			code: `a11y-unknown-role`,
			message,
		});
	}

	const implicit_role = get_implicit_role(element.name, attribute_map);
	if (implicit_role && implicit_role === value) {
		if (
			!(
				role_exceptions.has(element.name) &&
				role_exceptions.get(element.name) === value
			)
		) {
			element.component.warn(role_attribute, {
				code: `a11y-redundant-role`,
				message: `The element '${element.name}' has an implicit role of '${implicit_role}'. Defining this explicitly is redundant and should be avoided.`,
			});
		}
	}
}

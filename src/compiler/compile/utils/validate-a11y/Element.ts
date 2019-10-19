import Element from '../../nodes/Element';

const validators = [
	no_distracting_elements,
	structure,
	no_missing_attribute,
	required_content,
];

export default function validateA11y(element: Element) {
	for (const validator of validators) {
		validator(element);
	}
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
};

function no_missing_attribute(element: Element) {
	const attribute_map = new Map();

	element.attributes.forEach(attribute => {
		attribute_map.set(attribute.name, attribute);
	});

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
		const required_attributes = a11y_required_attributes[element.name];
		if (required_attributes) {
			const has_attribute = required_attributes.some(name =>
				attribute_map.has(name)
			);

			if (!has_attribute) {
				should_have_attribute(element, required_attributes);
			}
		}

		if (element.name === 'input') {
			const type = attribute_map.get('type');
			if (type && type.get_static_value() === 'image') {
				const required_attributes = ['alt', 'aria-label', 'aria-labelledby'];
				const has_attribute = required_attributes.some(name =>
					attribute_map.has(name)
				);

				if (!has_attribute) {
					should_have_attribute(
						element,
						required_attributes,
						'input type="image"'
					);
				}
			}
		}
	}
}

function should_have_attribute(node, attributes: string[], name = node.name) {
	const article = /^[aeiou]/.test(attributes[0]) ? 'an' : 'a';
	const sequence =
		attributes.length > 1
			? attributes.slice(0, -1).join(', ') +
			  ` or ${attributes[attributes.length - 1]}`
			: attributes[0];

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

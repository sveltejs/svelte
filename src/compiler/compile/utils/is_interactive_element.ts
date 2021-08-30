import Element from '../nodes/Element';

const interactiveInputTypes = new Set([
	'submit',
	'reset',
	'image',
	'button',
	'radio',
	'checkbox'
]);

export const is_interactive_element: (element: Element) => boolean = function (
	element
) {
	if (element.name === 'details') {
		return true;
	}

	if (element.name === 'summary') {
		return true;
	}

	if (element.name === 'a') {
		return element.attributes.some((attr) => attr.name === 'href');
	}

	if (element.name === 'button') {
		return true;
	}

	if (element.name === 'input') {
		const typeValue = element.attributes.find((attr) => attr.name === 'type');
        if (typeValue) {
		    return interactiveInputTypes.has((typeValue.get_static_value() || '').toString());
        }
        return false;
	}

	if (element.name === 'option') {
		return element.attributes.some((attr) => attr.name === 'value');
	}

	if (element.name === 'dialog') {
		return true;
	}

	return false;
};

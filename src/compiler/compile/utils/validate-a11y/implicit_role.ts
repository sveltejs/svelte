import Attribute from '../../nodes/Attribute';

function a(attribute_map: Map<string, Attribute>) {
	return attribute_map.has('href') ? 'link' : '';
}
function area(attribute_map: Map<string, Attribute>) {
	return attribute_map.has('href') ? 'link' : '';
}

function img(attribute_map: Map<string, Attribute>) {
	if (
		attribute_map.has('alt') &&
		attribute_map.get('alt').get_static_value() === ''
	) {
		return '';
	}
	return 'img';
}
function input(attribute_map: Map<string, Attribute>) {
	if (attribute_map.has('type')) {
		const value = attribute_map.get('type').get_static_value() || '';
		switch (value.toUpperCase()) {
			case 'BUTTON':
			case 'IMAGE':
			case 'RESET':
			case 'SUBMIT':
				return 'button';
			case 'CHECKBOX':
				return 'checkbox';
			case 'RADIO':
				return 'radio';
			case 'RANGE':
				return 'slider';
			case 'EMAIL':
			case 'PASSWORD':
			case 'SEARCH': // with [list] selector it's combobox
			case 'TEL': // with [list] selector it's combobox
			case 'URL': // with [list] selector it's combobox
			default:
				return 'textbox';
		}
	}
	return 'textbox';
}

function link(attribute_map: Map<string, Attribute>) {
	return attribute_map.has('href') ? 'link' : '';
}
function menu(attribute_map: Map<string, Attribute>) {
	if (attribute_map.has('type')) {
		const value = attribute_map.get('type').get_static_value();
		return value && value.toUpperCase() === 'TOOLBAR' ? 'toolbar' : '';
	}

	return '';
}
function menuitem(attribute_map: Map<string, Attribute>) {
	if (attribute_map.has('type')) {
		const value = attribute_map.get('type').get_static_value() || '';
		switch (value.toUpperCase()) {
			case 'COMMAND':
				return 'menuitem';
			case 'CHECKBOX':
				return 'menuitemcheckbox';
			case 'RADIO':
				return 'menuitemradio';
			default:
				return '';
		}
	}

	return '';
}

const implicit_role = new Map<
	string,
	string | ((attribute_map: Map<string, Attribute>) => string)
>([
	['a', a],
	['area', area],
	['article', 'article'],
	['aside', 'complementary'],
	['body', 'document'],
	['button', 'button'],
	['datalist', 'listbox'],
	['details', 'group'],
	['dialog', 'dialog'],
	['dl', 'list'],
	['form', 'form'],
	['h1', 'heading'],
	['h2', 'heading'],
	['h3', 'heading'],
	['h4', 'heading'],
	['h5', 'heading'],
	['h6', 'heading'],
	['hr', 'separator'],
	['img', img],
	['input', input],
	['li', 'listitem'],
	['link', link],
	['menu', menu],
	['menuitem', menuitem],
	['meter', 'progressbar'],
	['nav', 'navigation'],
	['ol', 'list'],
	['option', 'option'],
	['output', 'status'],
	['progress', 'progressbar'],
	['section', 'region'],
	['select', 'listbox'],
	['tbody', 'rowgroup'],
	['textarea', 'textbox'],
	['tfoot', 'rowgroup'],
	['thead', 'rowgroup'],
	['ul', 'list'],
]);

export default function get_implicit_role(
	name: string,
	attribute_map: Map<string, Attribute>
): string {
	if (implicit_role.has(name)) {
		const value = implicit_role.get(name);
		if (typeof value === 'string') {
			return value;
		}
		return value(attribute_map);
	}
	return '';
}

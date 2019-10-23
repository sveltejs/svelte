import Attribute from '../../nodes/Attribute';

export function array_to_string(values): string {
	return values.length > 1
		? `${values.slice(0, -1).join(', ')} or ${values[values.length - 1]}`
		: values[0];
}

export function is_hidden_from_screen_reader(name: string, attribute_map: Map<string, Attribute>) {
	if (name === 'input' && attribute_map.get('type').get_static_value() === 'hidden') {
    return true;
  }
  return attribute_map.has('aria-hidden');
}
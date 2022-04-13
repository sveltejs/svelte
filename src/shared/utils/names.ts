const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;

export function is_void(name: string) {
	return void_element_names.test(name) || name.toLowerCase() === '!doctype';
}

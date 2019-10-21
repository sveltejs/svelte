export function array_to_string(values): string {
	return values.length > 1
		? `${values.slice(0, -1).join(', ')} or ${values[values.length - 1]}`
		: values[0];
}

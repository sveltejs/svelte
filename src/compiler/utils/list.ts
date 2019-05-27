export default function list(items: string[], conjunction = 'or') {
	if (items.length === 1) return items[0];
	return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[
		items.length - 1
	]}`;
}

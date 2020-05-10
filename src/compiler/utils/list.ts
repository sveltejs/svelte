export default (items: string[], conjunction = 'or') =>
	items.length === 1 ? items[0] : items.slice(0, -1).join(', ') + `${conjunction} ${items[items.length - 1]}`;

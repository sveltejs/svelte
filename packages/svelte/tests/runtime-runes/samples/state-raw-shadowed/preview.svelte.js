export function preview_state() {
	let items = $state([]);
	items = [1, 2];
	const length = items.length;

	{
		const { items } = $state.raw({ items: ['draft'] });
		return `${length} ${items.length}`;
	}
}

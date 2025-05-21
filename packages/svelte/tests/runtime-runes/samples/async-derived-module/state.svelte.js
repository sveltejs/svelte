export async function create_derived(get_promise, get_num) {
	let value = $derived((await get_promise()) * get_num());

	return {
		get value() {
			return value;
		}
	};
}

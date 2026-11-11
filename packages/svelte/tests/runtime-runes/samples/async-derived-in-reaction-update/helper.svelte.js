/**
 * @param {() => Promise<number>} load
 */
export async function make(load) {
	let v = $derived(await load());

	return {
		get v() {
			return v;
		}
	};
}

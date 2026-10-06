<script>
	let b = $state(0);

	/** @type {Map<number, Array<() => void>>} */
	const registry = new Map();

	function f(value) {
		return new Promise((resolve) => {
			if (!registry.has(value)) registry.set(value, []);
			registry.get(value).push(() => resolve(value));
		});
	}

	export function set_b(v) {
		b = v;
	}

	/** resolve the promises created for `value` */
	export function settle(value) {
		for (const r of registry.get(value) ?? []) r();
		registry.delete(value);
	}
</script>

{#await f(b)}<i>pending</i>{:then v}<q>{v}</q>{/await}

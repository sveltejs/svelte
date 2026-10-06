<script>
	let a = $state(0);
	let b = $state(0);

	/** @type {Map<number, Array<() => void>>} */
	const registry = new Map();

	function f(value) {
		return new Promise((resolve, reject) => {
			if (!registry.has(value)) registry.set(value, []);
			registry.get(value).push(() => (value < 0 ? reject(value) : resolve(value)));
		});
	}

	export function set(values) {
		if ('a' in values) a = values.a;
		if ('b' in values) b = values.b;
	}

	/** resolve the promises created for `value` */
	export function settle(value) {
		for (const r of registry.get(value) ?? []) r();
		registry.delete(value);
	}
</script>

{#await f(a + b)}<i>pending</i>{:then v}<q>{v}</q>{:catch e}<s>{e}</s>{/await}

<script>
	let a = $state(0);
	let b = $state(0);

	/** @type {Map<string, Array<() => void>>} */
	const registry = new Map();

	function f(tag, value) {
		return new Promise((resolve) => {
			const key = tag + value;
			if (!registry.has(key)) registry.set(key, []);
			registry.get(key).push(() => resolve(value));
		});
	}

	export function set(values) {
		if ('a' in values) a = values.a;
		if ('b' in values) b = values.b;
	}

	/** resolve the promises created for `tag` and `value` */
	export function settle(tag, value) {
		for (const r of registry.get(tag + value) ?? []) r();
		registry.delete(tag + value);
	}
</script>

<p>{await f('p', b)}</p>
{#await f('aw', a + b)}<i>pending</i>{:then v}<q>{v}</q>{/await}
